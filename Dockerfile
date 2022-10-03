FROM node:16
ARG workspace_path
ADD ./node_modules $workspace_path/node_modules
