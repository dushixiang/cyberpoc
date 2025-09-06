# 多阶段构建 Dockerfile
# 阶段 1: 构建前端
FROM node:20-alpine AS frontend-builder

WORKDIR /app/web

# 复制前端源码
COPY web/ ./
# 安装依赖
RUN yarn install --frozen-lockfile
# 构建前端应用
RUN yarn build

# 阶段 2: 构建后端
FROM golang:1.25-alpine AS backend-builder

WORKDIR /app

# 安装构建依赖
RUN apk add --no-cache git gcc musl-dev

# 复制源码
COPY . .
# 下载依赖
RUN go mod tidy

# 复制前端编译成果
COPY --from=frontend-builder /app/web/dist ./web/dist/

# 构建应用
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags "-s -w" -o cyberpoc ./cmd/serv

# 阶段 3: 运行时镜像
FROM alpine:latest

# 安装运行时依赖
RUN apk --no-cache add ca-certificates tzdata

WORKDIR /opt/cyberpoc

# 创建非root用户
RUN addgroup -g 1001 -S cyberpoc && \
    adduser -S cyberpoc -u 1001

# 从构建阶段复制文件
COPY --from=backend-builder /app/cyberpoc .

# 复制配置文件模板 (如果存在)
COPY config.yaml* ./

# 复制初始数据
COPY default/ ./default/

# 创建必要的目录
RUN mkdir -p logs data && \
    chown -R cyberpoc:cyberpoc /opt/cyberpoc

# 切换到非root用户
USER cyberpoc

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

# 暴露端口
EXPOSE 8080

# 启动命令
CMD ["./cyberpoc", "serve", "--config", "config.yaml"]

