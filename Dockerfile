FROM ruphin/webserve

COPY . /usr/share/nginx/html
COPY ./node_modules/lit-html /usr/share/nginx/html/lit-html
COPY ./node_modules/gluonjs /usr/share/nginx/html/gluonjs
COPY ./node_modules/gluon-router /usr/share/nginx/html/gluon-router
COPY ./node_modules/gluon-keybinding /usr/share/nginx/html/gluon-keybinding
COPY ./node_modules/fontfaceobserver /usr/share/nginx/html/fontfaceobserver
COPY ./demo/* /usr/share/nginx/html/
