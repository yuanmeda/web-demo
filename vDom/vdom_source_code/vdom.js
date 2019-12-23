/**
 * 元素类型标记
 *  1. HTML - 标签 
 *  2. TEXT - 文本 
 *  3. COMPONENT - 组件
 */
const VNodeType = {
    HTML: 'HTML',
    TEXT: 'TEXT',

    COMPONENT: 'COMPONENT', //函数组件
    COMPONENT_CLASS: 'COMPONENT_CLASS', //类组件

}
/**
 * 子标签的种类
 *  1. EMPTY - 空 
 *  2. SINGLE - 一个子元素 
 *  3. MULTIPLE - 多个子元素
 */
const ChildType = {
    EMPTY: 'EMPTY',
    SINGLE: 'SINGLE',
    MULTIPLE: 'MULTIPLE'
}
/**
 * createElement 层级嵌套为两级，更深层级可以嵌套使用createElement
 * 如：const vnode =  createElement(
        'div',
        {id: 'app'},
        [createElement(
            'p',
            null,
            createElement(
                'span',
                null,
                '节点1'  //嵌套子元素
            )
        )]
    )
 * @param {标签} tag 
 * @param {属性对象} data 
 * @param {子元素} children 
 * @returns {vnode Object}
 */
function createElement(tag, data = null, children = null) {
    //创建元素类型标记 1. 标签 2.文本 3.组件
    let flags
    if (typeof tag === 'string') {
        flags = VNodeType.HTML
    } else if (typeof tag === 'function') {
        //todo:未完待续。。。
        flags = VNodeType.COMPONENT
    } else {
        flags = VNodeType.TEXT
    }

    //判断子标签类型
    let childrenFlags
    if (Array.isArray(children)) {
        const len = children.length
        if (len === 0) {
            childrenFlags = ChildType.EMPTY
        } else {
            childrenFlags = ChildType.MULTIPLE
        }
    } else if (children === null) {
        childrenFlags = ChildType.EMPTY
    } else {
        //其他情况视为纯文本，即单个子节点，会调用 createTextVNode 创建纯文本类型的 VNode
        childrenFlags = ChildType.SINGLE
        children = createTextVNode(children + '')
    }

    //返回vnode 对象
    return {
        flags,
        tag,
        data,
        key: data && data.key,
        children,
        childrenFlags,
        el: null //虚拟dom对应的真是dom,在渲染的时候挂载
    }
}

/**
 * createTextVNode 创建文本vnode,子节点为空，文本内容为text
 * @param {文本内容} text 
 */
function createTextVNode(text) {
    return {
        flags: VNodeType.TEXT,
        tag: null,
        data: null,
        children: text,
        childrenFlags: ChildType.EMPTY
    }
}


/**
 * 渲染分为首次渲染和再次渲染
 * @param {虚拟dom} vnode 
 * @param {容器el} container 
 */
function render(vnode, container) {
    let preVnode = container.vnode
    if (preVnode == null) {
        // 没有旧的 VNode，则调用 `mount` 函数挂载全新的 VNode
        mount(vnode, container)
    } else {
        // 有旧的 VNode，则调用 `patch` 函数打补丁
        patch(preVnode, vnode, container)

    }
    // 更新vnode
    container.vnode = vnode
}

/**
 * mount 挂载节点
 * @param {vdom 节点} vnode 
 * @param {容器el} container 
 * @param {插入位置的参照节点} refNode 
 */
function mount(vnode, container, refNode) {
    switch (vnode.flags) {
        // 挂载普通标签
        case VNodeType.HTML:
            mountElement(vnode, container, refNode)
            break
        //挂载普通文本
        case VNodeType.TEXT:
            mountText(vnode, container)
            break
        default:
            break
    }
}

/**
 * 插入元素，子元素，设置属性
 * @param {*} vnode 
 * @param {*} container 
 * @param {*} refNode 
 */
function mountElement(vnode, container, refNode) {
    const el = document.createElement(vnode.tag)
    vnode.el = el

    const { data, children, childrenFlags } = vnode
    //设置属性
    if (data !== null) {
        for (let key in data) {
            // 挂载和更新属性 元素对象，类型，旧值，新值
            patchAttrData(el, key, null, data[key])
        }
    }

    // 根据子元素个数不同，进行挂载
    switch (childrenFlags) {
        case ChildType.EMPTY:
            break
        case ChildType.SINGLE:
            mount(children, el)
            break
        case ChildType.MULTIPLE:
            for (let i = 0; i < children.length; i++) {
                mount(children[i], el)
            }
            break
        default:
            break
    }

    refNode ? container.insertBefore(el, refNode) : container.appendChild(el)

}

function mountText(vnode, container) {
    // 创建真实文本节点,将真实el挂在vnode的el属性上
    const el = document.createTextNode(vnode.children)
    vnode.el = el
    container.appendChild(el)
}

/**
 * patchAttrData 挂载和更新元素的属性
 * @param {元素dom} el 
 * @param {属性name} key 
 * @param {旧属性值} oldV 
 * @param {新属性值} newV 
 */
function patchAttrData(el, key, oldV, newV) {
    switch (key) {
        case 'style':
            for (let n in newV) {
                el.style[n] = newV[n]
            }
            // 删除newV中没有，oldV中有的属性值
            for (let n in oldV) {
                if (!newV.hasOwnProperty(n)) {
                    el.style[n] = ''
                }
            }
            break
        case 'class':
            el.className = newV
            break
        default:
            if (key[0] === '@') {
                // 移除旧事件
                if (oldV) {
                    el.removeEventListener(key.slice(1), oldV)
                }
                if (newV) {
                    el.addEventListener(key.slice(1), newV)
                }
            } else {
                // 当做普通的属性处理
                el.setAttribute(key, newV)
            }
    }
}

/**
 * 分类patch 元素类型和文本类型
 * @param {*} preVnode 
 * @param {*} vnode 
 * @param {*} container 
 */
function patch(preVnode, vnode, container) {
    // 判断vnode的flas是否相同
    const preNodeFlags = preVnode.flags
    const vnodeFlags = vnode.flags

    if (vnodeFlags !== preNodeFlags) {
        // 节点类型不同,直接替换
        replaceVNode(preVnode, vnode, container)
    } else if (vnodeFlags == VNodeType.HTML) {
        patchElement(preVnode, vnode, container)
    } else if (vnodeFlags == VNodeType.TEXT) {
        patchText(preVnode, vnode)
    }
}

/**
 * patchElement 更新data、children
 * @param {*} preVnode 
 * @param {*} vnode 
 * @param {*} container 
 */
function patchElement(preVnode, vnode, container) {
    // 判断新旧标签是不是相同的标签，不同则直接替换
    if (vnode.tag !== preVnode.tag) {
        replaceVNode(preVnode, vnode, container)
        return
    }
    const el = (vnode.el = preVnode.el)
    const preData = preVnode.data
    const data = vnode.data

    // 遍历新data
    if (data !== null) {
        for (let key in data) {
            patchAttrData(el, key, preData[key], data[key])
        }
    }

    // 遍历旧preData,删除data中没有的属性
    if (preData !== null) {
        for (let key in preData) {
            if (preData[key] && !data.hasOwnProperty(key)) {
                patchAttrData(el, key, preData[key], null)
            }
        }
    }

    // 调用 patchChildren 函数递归的更新子节点
    patchChildren(
        preVnode.childrenFlags, // 旧的 VNode 子节点的类型
        vnode.childrenFlags, // 新的 VNode 子节点的类型
        preVnode.children, // 旧的 VNode 子节点
        vnode.children, // 新的 VNode 子节点
        el // 当前标签元素，即这些子节点的父节点
    )

}

/**
 * 
 * @param {*} preChildFlags 旧的 VNode 子节点的类型
 * @param {*} childFlags 新的 VNode 子节点的类型
 * @param {*} preChildren 旧的 VNode 子节点
 * @param {*} children 新的 VNode 子节点
 * @param {*} el 当前标签元素，即这些子节点的父节点
 */
function patchChildren(
    preChildFlags,
    childFlags,
    preChildren,
    children,
    el
) {
    // 新旧子节点都有三种情况，这里依次枚举了九种情况
    switch (preChildFlags) {
        case ChildType.SINGLE:
            switch (childFlags) {
                // 1.1 旧的是文本,新的是文本 => 直接做更新操作
                case ChildType.SINGLE:
                    patch(preChildren, children, el)
                    break
                // 1.2 旧的是文本,新的是空 => 删除旧文本
                case ChildType.EMPTY:
                    el.removeChild(preChildren.el)
                    break
                // 1.2 旧的是文本,新的是多个 => 删除并挂载
                case ChildType.MULTIPLE:
                    el.removeChild(preChildren.el)
                    for (let i = 0; i < children.length; i++) {
                        mount(children[i], el)
                    }
                    break
                default:
                    break
            }
            break
        case ChildType.EMPTY:
            switch (childFlags) {
                // 2.1 旧的是空,新的是一个 => 直接新建
                case ChildType.SINGLE:
                    mount(children, el)
                    break
                // 2.2 旧的是空,新的是空 => 不管
                case ChildType.EMPTY:
                    break
                // 2.3 旧的是空,新的是多个 => 直接新建
                case ChildType.MULTIPLE:
                    for (let i = 0; i < children.length; i++) {
                        mount(children[i], el)
                    }
                    break
                default:
                    break
            }
            break
        case ChildType.MULTIPLE:
            switch (childFlags) {
                // 3.1 旧的是多个,新的是一个 => 删除再新建
                case ChildType.SINGLE:
                    for (let i = 0; i < preChildren.length; i++) {
                        el.removeChild(preChildren[i].el)
                    }
                    mount(children, el)
                    break
                // 3.2 旧的是多个,新的是空 => 直接删除
                case ChildType.EMPTY:
                    for (let i = 0; i < preChildren.length; i++) {
                        el.removeChild(preChildren[i].el)
                    }
                    break
                // 3.3 新旧都是多个子节点时，这里的diff操作，是框架之间优化点的区别之处，也是影响性能的关键之处
                case ChildType.MULTIPLE:
                    diffChildren(preChildren, children, el)
                    break
                default:
                    break
            }
            break
        default:
            break
    }
}
/**
 * 新旧子节点都是多个时
 * 相同的节点：patch、移动
 * 新节点：mount
 * 没有的节点：移除
 * @param {*} preChildren 
 * @param {*} children 
 * @param {*} el 
 */
function diffChildren(preChildren, children, el) {
    let lastIndex = 0
    // 遍历children,
    // 如果找到相同的节点，则进行patch，再判断是否需要移动位置
    // 如果未找到节点，则插入新节点

    for (let i = 0; i < children.length; i++) {
        const newNode = children[i]
        let find = false
        for (let j = 0; j < preChildren.length; j++) {
            const oldNode = preChildren[j]
            if (oldNode.key === newNode.key) {
                find = true
                patch(oldNode, newNode, el)
                // 移动的思路（以index.html中为例）：
                // 初始化lastIndex为0
                // 找到children[0]对应preChildren[1]，将值设定为1
                // 再次匹配，如果j的相对位置小于lastIndex，则需要移动,否则将新的相对位置赋值给lastIndex
                // 找到上一个已经diff好的children[i-1].el(真是dom)的下一个兄弟元素前插入当前元素
                // 可再此debugger，查看具体过程
                if (j < lastIndex) {
                    const refNode = children[i - 1].el.nextSibling // 可能为null
                    //在refNode之前插入需要移动的dom节点
                    el.insertBefore(oldNode.el, refNode)
                    break
                } else {
                    // 更新 lastIndex
                    lastIndex = j
                }
            }
        }
        if (!find) {
            // 挂载新节点
            // 在已经挂载好的children[i - 1].el兄弟元素前插入
            // 如果children[i - 1].el本身是最后一个元素，则children[i - 1].el.nextSibling为null
            // 等价于直接在最后插入
            const refNode =
                i - 1 < 0
                    ? preChildren[0].el
                    : children[i - 1].el.nextSibling

            mount(newNode, el, refNode)
        }
    }

    // 遍历preChildren 删除children中没有的节点
    for( let i=0; i< preChildren.length;i++){
        const preNode = preChildren[i]
        const has = children.find(n => n.key === preNode.key)
        if(!has){
            el.removeChild(preNode.el)
        }
    }
}

function replaceVNode(preVnode, vnode, container) {
    container.removeChild(preVnode)
    mount(vnode, container)
}

function patchText(preVnode, vnode) {
    // 拿到文本节点 el，同时让 nextVNode.el 指向该文本节点
    const el = (vnode.el = preVnode.el)
    // 文本不同才需要更新
    if (vnode.children !== preVnode.children) {
        el.nodeValue = vnode.children
    }
}

