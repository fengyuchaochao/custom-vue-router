let _Vue = null;
class CustomVueRouter {
    static install (Vue) {
        //1. 判断是否安装过vue-router
        if (CustomVueRouter.install.installed) {
            return;
        }
        CustomVueRouter.install.installed = true;
        //2. 定义vue全局变量，其他地方要使用vue中提供的方法
        _Vue = Vue;
        //3. 把向vue实例中传入的router对象注入到vue实例中。
        _Vue.mixin({
            beforeCreate () {
                if (this.$options.router) {
                    _Vue.prototype.$router = this.$options.router;
                    this.$options.router.init();
                }
            }
        })
    }
    constructor (options) {
        this.options = options;
        this.mode = options.mode || 'hash';
        this.routeMap = {};
        this.data = _Vue.observable({
            current: '/'
        })
    }
    init () {
        this.initRouteMap();
        this.initComponent(_Vue);
        this.initEvent();
    }
    initRouteMap () {
        //遍历所有路由规则，并且解析成键值对的形式，存储到routeMap对象中。
        let routes = this.options.routes;
        routes.forEach(route => {
           this.routeMap[route.path] = route.component;
        });
    }
    initComponent (Vue) {
        //创建router-link组件
        let that = this;
        Vue.component('router-link', {
            props: {
                to: String,
            },
            render (h) {
                return h('a', {
                    attrs: {
                        href: this.to
                    },
                    on: {
                        click: this.clickHandler
                    }
                }, [this.$slots.default])
            },
            methods: {
                clickHandler (e) {
                    e.preventDefault();
                    if (that.mode === 'hash') {
                        location.hash = this.to;
                    } else if (this.mode === 'history') {
                        history.pushState(null, '', this.to);
                    }
                    this.$router.data.current = this.to;
                }
            }
            //template: '<a :href="to"><slot></slot></a>'
        });
        //创建router-view组件
        Vue.component('router-view', {
            render: (h) => {
                const component = this.routeMap[this.data.current];
                return h(component);
            }
        });
    }
    initEvent () {
        window.addEventListener('popstate', () => {
            this.data.current = window.location.pathname;
        });
        window.addEventListener('hashchange', () => {
            let hash = window.location.hash.substr(1);
            this.data.current = hash;
        })
    }
}

export default CustomVueRouter
