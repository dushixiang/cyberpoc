.PHONY: tidy build build-web build-server deploy build-deploy clean check-remote check-process
tidy:
	go mod tidy -v
	go fmt ./...
	gofmt -s -w .

wire-install:
	go install github.com/google/wire/cmd/wire@latest

wire:
	wire ./internal/cyber
	wire ./internal/identity

build-web:
	echo "当前时间: $(shell date)"
	# 使用 $(shell date) 正确执行 date 命令，并将结果写入文件
	echo "export const BuildAt = '$(shell LC_TIME=zh_CN.UTF-8 date "+%Y年%m月%d日 %A %H:%M:%S")';" > web/src/helpers/build_at.ts
	cd web && yarn build

build-server:
	CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -ldflags '-s -w' -o bin/cyberpoc cmd/serv/main.go
	upx bin/cyberpoc

# 编译项目
build:
	make build-web
	make build-server

# 部署到服务器
deploy:
	@echo "开始部署到 192.168.1.110:/opt/cyberpoc/"
	ssh root@192.168.1.110 "mkdir -p /opt/cyberpoc"
	ssh root@192.168.1.110 "rm -f /opt/cyberpoc/cyberpoc"
	scp bin/cyberpoc root@192.168.1.110:/opt/cyberpoc/cyberpoc
	ssh root@192.168.1.110 "chmod +x /opt/cyberpoc/cyberpoc"
	@echo "部署完成"

# 构建并部署（一键操作）
build-deploy:
	make build
	make deploy

# 清理构建文件
clean:
	rm -rf bin/*
	rm -rf web/dist
	rm -rf web/src/helpers/build_at.ts

# 检查远程服务器状态
check-remote:
	@echo "检查远程服务器状态..."
	ssh root@192.168.1.110 "ls -la /opt/cyberpoc/"

# 查看远程服务器进程
check-process:
	@echo "查看远程服务器进程..."
	ssh root@192.168.1.110 "ps aux | grep cyberpoc"

# Docker 相关命令
.PHONY: docker-build docker-push docker-tag docker-all

# 构建 Docker 镜像
docker-build:
	docker build -t cyberpoc:latest .

# 标记镜像为 Docker Hub 格式
docker-tag:
	docker tag cyberpoc:latest dushixiang/cyberpoc:latest
	docker tag cyberpoc:latest dushixiang/cyberpoc:$(shell git describe --tags --always --dirty)

# 推送镜像到 Docker Hub
docker-push: docker-tag
	docker push dushixiang/cyberpoc:latest
	docker push dushixiang/cyberpoc:$(shell git describe --tags --always --dirty)

# 构建并推送 Docker 镜像（完整流程）
docker-all: docker-build docker-push

start-dev-db:
	docker compose -f docker-compose.dev.yaml up -d

stop-dev-db:
	docker compose -f docker-compose.dev.yaml down