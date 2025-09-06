#!/bin/bash

# 检查是否提供了参数
if [ $# -eq 0 ]; then
    echo "请提供要删除的 tag 名称作为参数"
    exit 1
fi

tag_name=$1

# 删除本地 tag
git tag -d "$tag_name"

# 推送删除操作到远程仓库
git push --delete origin "$tag_name"