package service

import (
	"crypto/tls"
	_ "embed"
	"net"
	"net/http"
	"net/http/httputil"
	"strings"
	"sync"
	"time"

	"go.uber.org/zap"
)

func NewReverseProxyService(logger *zap.Logger) *ReverseProxyService {
	service := &ReverseProxyService{
		logger: logger,
	}
	reverseProxy := &httputil.ReverseProxy{Director: service.director}
	var InsecureTransport http.RoundTripper = &http.Transport{
		DialContext: (&net.Dialer{
			Timeout:   30 * time.Second,
			KeepAlive: 30 * time.Second,
		}).DialContext,
		TLSClientConfig:     &tls.Config{InsecureSkipVerify: true},
		TLSHandshakeTimeout: 10 * time.Second,
	}
	reverseProxy.Transport = InsecureTransport
	service.reverseProxy = reverseProxy
	return service
}

type ReverseProxyService struct {
	logger       *zap.Logger
	reverseProxy *httputil.ReverseProxy
	apps         sync.Map
}

type App struct {
	Host     string
	Protocol string
}

func (s *ReverseProxyService) AddApp(key string, app App) {
	s.apps.Store(key, app)
}

func (s *ReverseProxyService) DelApp(key string) {
	s.apps.Delete(key)
}

func (s *ReverseProxyService) director(req *http.Request) {
	host := req.Host
	parts := strings.Split(host, ".")

	appKey := parts[0]
	value, _ := s.apps.Load(appKey)
	app := value.(App)
	req.URL.Scheme = app.Protocol
	req.URL.Host = app.Host
}

func (s *ReverseProxyService) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	host := r.Host
	//request, _ := httputil.DumpRequest(r, false)
	//s.logger.Sugar().Debug(string(request))
	parts := strings.Split(host, ".")
	if len(parts) < 2 {
		_, _ = w.Write([]byte(`bad request`))
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	appKey := parts[0]
	_, ok := s.apps.Load(appKey)
	if !ok {
		_, _ = w.Write(errorPage)
		w.WriteHeader(http.StatusNotFound)
		return
	}
	start := time.Now()
	s.reverseProxy.ServeHTTP(w, r)
	s.logger.Sugar().Debugf(
		"%s\t\t%s\t\t%s\t\t%v",
		r.Method,
		r.RequestURI,
		r.RemoteAddr,
		time.Since(start),
	)
}

//go:embed reverse_proxy_service_error_page.html
var errorPage []byte

func (s *ReverseProxyService) ProxyRequestHandler() func(http.ResponseWriter, *http.Request) {
	return s.ServeHTTP
}
