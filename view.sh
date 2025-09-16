# 为了避免后面重复拉取,所以在项目原文件地址的时候,请使用这个命令存储账号和密码,让页面进行访问
# git config --global credential.helper wincred
git config --global credential.helper store
#git地址
git_path="https://e.coding.net/itaem-gdou/xiaolianxi/wangwei-learn.git"
#项目路径
code_path="/test/"
#项目名称，与giturl那一致
projectName="wangwei-learn"

#如果项目文件夹不存在说明没有下载过改项目代码，需要检出该项目
echo ${projectName}"存在，更新代码"
cd ${code_path}${projectName}
git pull
echo "打包运行完成"
echo "调用docker命令"
echo "删除所有容器"
# 删除所有容器
docker builder prune
docker-compose down --rmi all
echo "重新根据docker文件创建镜像"
# 重新根据docker文件创建镜像
docker compose build
echo "停止容器"
# 停止容器
docker compose stop
echo "删除容器"
# 删除容器
docker compose rm
echo "重新创建，运行容器"
# 重新创建，运行容器
docker compose up -d # -d 代表后台运
echo "删除空悬镜像"
# 删除空悬镜像
docker rmi $(docker images -f "dangling=true" -q)
echo "success"
