interface statisticsTitleAndTypeArr {
    parameter: {
        type: string,
        filter?: any
        field?: any
        [key: string]: any
    },
    title: string,
    type: string,
    fun: spmFun | string
}

type spmFun = "selectSpm" | "selectSpmDis" | "selectSpmDisTotal" | "selectSpmSum";

interface exportStatistics {
    fixParameter: {
        [key: string]: any
    },
    title: string,
    fun: "exportStatistics" | string
}

interface selectWinnerTitleAndTypeArr {
    title: string, //标题
    showTime: boolean,//是否需要时间查询
    fun: "selectWinnerData" | string,//云函数方法名，自定义
    fixParameter: {
        [key: string]: any,
        sort?: any
        filter?: any
        winnerTitleAndTypeArr?: prizeOption[]
    },//固定参数，查询接口时候会默认带上内部所有参数
    parameter: {  //动态参数，比如 type:'type值1'
        [key: string]: {
            type: "radio" | string, //单选框
            title: string,
            options: option[]
        }
    },
    data: prizeOption[]
}

interface winnerTitleAndTypeArr {
    title: string,
    export: {
        showTime: boolean,
        fixParameter: {
            winnerTitleAndTypeArr?: prizeOption[],
            sort?: any
            filter?: any
            [key: string]: any
        },
        parameter: {  //动态参数，比如 type:'type值1'
            [key: string]: {
                type: "radio" | string, //单选框
                title: string,
                options: option[]
            }
        }
        title: string,
        fun: "exportsPrize" | string
    }
}


interface userNicksExportsArr {
    title: string,
    export: {
        showTime: boolean,
        fixParameter: {
            filter?: any
            [key: string]: any
        },
        parameter: {
            [key: string]: {
                "options": option[],
                "type": "radio" | string,
                "title": string
            }
        },
        title: string,
        fun: "exportsNick" | string
    }
}

interface behaviorTitleAndTypeArr {
    title: string,
    export: {
        showTime: boolean,
        fixParameter: {
            extMatch?: any
            sort?: any
            [key: string]: any
        },
        parameter: {
            [key: string]: {
                options: option[],
                type: "radio" | string,
                title: string
            }
        },
        title: string,
        fun: "selectBehavior" | "defaultNickSelect" | "assistNickSelect" | string
    }
}


interface reissueArr {
    title: string,
    export: {
        showTime: boolean,
        fixParameter: {
            [key: string]: any
        },
        parameter: {
            [key: string]: prizeOption
        },
        title: string,
        fun: "reissueScore" | "reissueBenefit" | "reissueMark"
    }
}

interface option {
    title: string
    value: string
}

interface prizeOption {
    title: string,
    type: string,
    targetField?: string
}

interface generateSpmConfig {
    title: string,
    type: string,
    fun: spmFun
}

type generateParameterType = { key: string, type?: string, title: string }
