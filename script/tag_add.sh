#!/bin/bash

# 检查是否提供了参数
if [ $# -eq 0 ]; then
    echo "请提供要添加的 tag 名称作为参数"
    exit 1
fi

tag_name=$1

# 创建本地 tag
git tag "$tag_name"

# 推送 tag 到远程仓库
git push origin "$tag_name"
