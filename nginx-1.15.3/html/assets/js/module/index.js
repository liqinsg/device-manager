//表格渲染
var vueDeviceList = new Vue({
    el: "#device-list",
    components: {
      'search-device': SearchDevice
    },
    data: {
        device:true,
        category:"",
        address:"",
        user:"",
        deviceList: [
            {
                "id": "0",
                "name": "",
                "nationalId": "",
                "serialNumber": "",
                "useTime": 0,
                "unitPrice": 0,
                "statusId": 0,
                "createTime": 0,
                "updateTime": 0,
                "brand": {
                    "id": "0",
                    "name": ""
                },
                "locationStr": "",
                "categoryStr": "",
                "workNature": "",
                "custodian": "",
                "amountUnit": "",
                "useDepartment": "",
                "deviceModel": ""
            }
        ],
        sortList: [
            {
                id: '0',
                name: '',
                level: '',
                children: [
                ]
            }
        ],
        dataList:{
            parentId: "",
            queryPage: {
                pageNum: 1,
                pageSize: 10
            }
        },
        addressList: [
            {
                "id": "",
                "name": "",
            },
        ],
        userList: [
            {
                "id": "",
                "username": "",
                "realName": "",
                "email": "",
                "phone": "",
                "lastTime": "",
                roleList:[{
                    "name":""
                }]
            }
        ],
        queryParams: $.extend(true,{},searchDeviceParams),
        pages: 1,//总页数
        total: 0,//总条数
        showButton:false,
        isSort:false,
        disableLastPage: true,
        disableNextPage: true,
        //搜索的选项卡数据,
        searchSelection: $.extend(true,{},deviceSearchSelection)
    },
    methods: {
        /**
         * 渲染表格
         */
        //模态框传参
        getValue:function (a,b) {
        addCategory.category.parentId=a;
        addCategory.parentName=b;
},
        //分类
        sort:function(){
            sendPost({
                url:API.getApi(API.listCategoryByPId),
                data: JSON.stringify(vueDeviceList.dataList),
                type:'post',
                dataType:"json",
                contentType:"application/json",
                success:function (data) {
                    vueDeviceList.sortList=data.data;
                },
                error:function () {
                    alert("失败");
                }
            })
        },
        //删除分类
        deleteCategory:function (rootId) {
            sendPost({
                url:API.getApi(API.deleteCategory)+rootId,
                type:'post',
                dataType:"json",
                contentType:"application/json",
                headers: {
                    token: localStorage.getItem(STORAGE_KEY.token)
                },
                success:function (data) {
                    alert(data.msg);
                    vueDeviceList.sort();
                },
                error:function () {
                    alert("失败");
                }
            })
        },
        /*获取设备列表*/
        listDevice: function () {
            var vue = this;
            sendPost({
                url: API.getApi(API.listDevice),
                data: JSON.stringify(vue.queryParams),
                success: function (res) {
                    var data = res.data;
                    if (res.code == 0) {
                        vueDeviceList.deviceList = data.list;
                        vueDeviceList.total = data.total;
                        vueDeviceList.pages = data.pages;
                        vueDeviceList.disableNextPage = vueDeviceList.queryParams.queryPage.pageNum === data.pages;
                        vueDeviceList.disableLastPage = vueDeviceList.queryParams.queryPage.pageNum <= 1;
                    } else {
                        alert(res.msg);
                    }
                },
                error: function (res) {
                    var json = res.responseJSON;
                    if (json != null && json.code == 3) {
                        alert("登录异常！");
                        window.location.href = "login.html";
                    } else {
                        alert("网络连接异常！");
                    }
                }
            });

        },
        /*获取用户列表*/
         ListUser:function(){
            sendPost({
                url:API.getApi(API.ListUser),
                data: JSON.stringify(
                    {
                        "pageNum": 1,
                        "pageSize": 20,
                    }
                ),
                success: function (res) {
                    var data = res.data;
                    if (res.code == 0) {
                        vueDeviceList.userList = data;
                        console.log(data);
                    } else {
                        alert(res.msg);
                    }
                },
                error: function (res) {
                    var json = res.responseJSON;
                    if (json != null && json.code == 3) {
                        alert("登录异常！");
                    } else {
                        alert("网络连接异常！");
                    }
                }
            });
        },
        //打印用户角色名
        listRole:function(roleList)
        {
            var res = "";
            for (var i=0;i<roleList.length;i++){
                if (i === 0){
                    res = roleList[0].name;
                } else {
                    res = res + "/" + roleList[i].name;
                }
            }
            return res;
        },
        //删除用户传值
        showDeleteUserModal:function(userId)
        {
            $("#delete-user").modal('toggle');
            deleteUserVm.user.id = userId;
        },
        /*获取地点列表*/
        addressDevice:function(){
            sendPost({
                url:API.getApi(API.addressDevice),
                data: JSON.stringify(
                    {
                        "parentId": "",
                        "queryPage": {
                            "pageNum": 1,
                            "pageSize": 10
                        }
                    }
                ),
                success: function (res) {
                    var data = res.data;
                    if (res.code == 0) {
                        vueDeviceList.addressList = data;
                        console.log(data);
                    } else {
                        alert(res.msg);
                    }
                },
                error: function (res) {
                    var json = res.responseJSON;
                    if (json != null && json.code == 3) {
                        alert("登录异常！");
                    } else {
                        alert("网络连接异常！");
                    }
                }
            });
        },
        /*获取点击的地点*/
        getaddress:function(address){
            id = address.id;
            console.log(id)
        },
        //翻到上一页
        lastPage: function () {
            if (this.queryParams.queryPage.pageNum > 1) {
                this.queryParams.queryPage.pageNum--;
                this.listDevice();
            }
        },
        //翻到下一页
        nextPage: function () {
            if (this.pages > this.queryParams.queryPage.pageNum) {
                this.queryParams.queryPage.pageNum++;
                this.listDevice();
            }
        },
        //设备格式化时间
        formatTime: function (timestamp,deviceStatusId) {
            return deviceStatusId===1 ? '' : formatTime(timestamp);
        },
        //用户格式化时间
        userFormatTime: function (timestamp) {
            return formatTime(timestamp);
        },
        /**
         * 解析设备状态
         * @param status 状态吗
         * @returns {*}中文释义
         */
        /*设备状态*/
        parseStatus: function (status) {
            switch (status) {
                case 1:
                    return '入库';
                case 2:
                    return '使用中';
                case 3:
                    return '报废';
            }
        },
        getDepartment: function (locationStr) {
            return locationStr.substring(locationStr.indexOf('/') + 1 ,locationStr.length);
        },
        showDistributeModal: function (deviceId) {
            deviceModalVm.distributeDeviceParam.deviceIdList.push(deviceId);
            $('#distribute-device-modal').modal('toggle');
        },
        showDiscardModal: function (deviceId) {
            deviceModalVm.discardDeviceParam.deviceId = deviceId;
            $('#discard-device-modal').modal('toggle');
        },
        showDetailsModal:function (device) {
            console.log(device)
            deviceDtail.id=device.id;
            deviceDtail.brand=device.brand;
            deviceDtail.deviceModel=device.deviceModel;
            deviceDtail.location=device.locationStr;
            deviceDtail.name=device.name;
            deviceDtail.department=vueDeviceList.getDepartment(device.locationStr);
            deviceDtail.status=vueDeviceList.parseStatus(device.statusId);
            deviceDtail.unitPrice=device.unitPrice;
            deviceDtail.categoryStr=device.categoryStr;
            deviceDtail.custodian=device.custodian;
            deviceDtail.nationalId=device.nationalId;
            deviceDtail.serialNumber=device.serialNumber;
            deviceDtail.statusId=vueDeviceList.parseStatus(device.statusId);
            deviceDtail.workNature=device.workNature;
            deviceDtail.time=vueDeviceList.formatTime(device.useTime,device.statusId);
            $("#device-description").val(device.desciption);
            deviceChange.id=device.id;
            deviceChange.getData();
            $('#device-detail').modal('toggle');

            // deviceDetails.getCategory();
            // deviceDetails.getLocation();

        }
    },
    created: function () {
        this.listDevice(this);
    }
});
//详情模态框
var deviceDtail=new Vue({
    el:'#table-device-detail',
    data:{
        id:"",
        name:'',
        categoryStr:'',
        department:'',
        brand:'',
        deviceModel:'',
        nationalId:'',
        serialNumber:'',
        location:"",
        workNature:'',
        custodian:'',
        unitPrice:'',
        statusId:'',
        time:'',
        status:'',
        category:'',
        selection: $.extend(true,{},deviceSearchSelection),
    },

    methods:{
        //添加设备
        addDevice: function () {
            var data = this.device;
            sendPost({
                url: API.getApi(API.addDevice),
                data: JSON.stringify(data),
                success: function (res) {
                    if (res.code == 0){
                        alert("添加成功！");
                        $("#add-device").modal('toggle');
                        //刷新设备列表
                        vueDeviceList.listDevice();
                    }else {
                        alert(res.msg);
                    }
                }
            });
        },
        //获取添加设备选项卡数据
        getDeviceSelection: function () {
            var self = this;
            sendPost({
                url:API.getApi(API.getDeviceSelection) + "/20",
                success: function (res) {
                    console.log(res)
                    if (res.code === 0){
                        //渲染选项卡数据
                        self.selection.categoryList = res.data.categoryList;
                        self.selection.brandList = res.data.brandList;
                        self.selection.deviceModelList = res.data.deviceModelList;
                        self.selection.locationList = res.data.locationList;
                        self.selection.workNatureList = res.data.workNatureList;
                        self.selection.custodianList = res.data.custodianList;
                        //选项数据同样给到搜索设备组件中
                        vueDeviceList.searchSelection = $.extend(true,{},res.data);
                        //选项数据复制给分发设备组件
                        deviceModalVm.distributeSelection = $.extend(true,{},res.data);
                    }else {
                        console.error(res.msg);
                    }
                }
            });
        }
    },
    created: function () {

        this.getDeviceSelection();
    }

})
var deviceChange=new Vue({
    el:'#device-change',
    data:{
        id:'',
        List: [
            {
                "id": "",
                "fromStatus": -1,
                "toStatus": 1,
                "operateTime": 1537942059000,
                "operateUserId": "1526467363362171844",
                "fromLocation": "十教",
                "toLocation": "温江",
                "operateUserRealName": "黄雅哲"
            }
        ]
    },
    methods:{
        getData:function(){
            sendPost({
                url:API.getApi(API.DeviceRecord),
                data: JSON.stringify({
                    "deviceId":this.id,
                        "queryPage": {
                    "pageNum": 1,
                    "pageSize": 20
                }
            }
                ),
                success: function (res) {
                    var data = res.data.list;
                    if (res.code == 0) {
                        console.log(data)
                        deviceChange.List= data;
                    } else {
                        alert(res.msg);
                    }
                },
                error: function (res) {
                    var json = res.responseJSON;
                    if (json != null && json.code == 3) {
                        alert("登录异常！");
                    } else {
                        alert("网络连接异常！");
                    }
                }
            });
        },
        parseStatus: function (status) {
            switch (status) {
                case 1:
                    return '入库';
                case 2:
                    return '使用中';
                case 3:
                    return '报废';
            }
        },
        formatTime:function(timestamp) {
        var date = new Date(timestamp);
        return date.getFullYear() + "." + date.getMonth() + "." + date.getDay();
}
    }
})
//渲染分发设备模态框，报废设备模态框
var deviceModalVm = new Vue({
    el: '#device-modals',
    components: {
        'distribute-device': DistributeDevice,
        'discard-device': DiscardDevice
    },
    data: {
        //分发设备的参数
        distributeDeviceParam: {
            deviceIdList: [],
            locationId: null
        },
        distributeSelection: $.extend(true,{},deviceSearchSelection),
        discardDeviceParam: {
            deviceId: null
        }
    },
    template: '<div>'+
        '<distribute-device :distributeParam=\"distributeDeviceParam\" :selection=\"distributeSelection\"></distribute-device>'+
        "<discard-device :discardParams=\"discardDeviceParam\"></discard-device>"+
        '</div>'
});

//生成设备分类树，依赖于addDeviceVm
var categoryVm = new Vue({
    el: '#category-tree',
    components: {
        'CategoryTree': CategoryTree
    },
    data: {
        categoryList: [
            {
                id: '0',
                name: '',
                level:'',
                children: [
                ],
                active:true,//是否激活
                expanded: false//是否展开
            }
        ],
        tree:true
    },
    template: ' <div id="category-tree" v-if="tree" class="panel-body">\n' +
        '                            <CategoryTree v-for="(item,i) in categoryList" :index="i" :parent="item" :key="item.id"></CategoryTree>\n' +
        '                        </div>'
});
//生成地点分类树，依赖于addressVm
var addresstreeVm = new Vue({
    el: '#address-tree',
    components: {
        'AddressTree': AddressTree
    },
    data: {
        addressList: [
            {
                parentId: "",
                level:'',
                children: [
                ],
                active: false,//是否激活
                expanded: false,//是否展开

            }
        ],
        atree:false
    },
    template: ' <div id="address-tree" class="panel-body" v-if="atree">\n' +
        '                            <AddressTree v-for="(item,i) in addressList" :index="i" :parent="item" :key="item.id"></AddressTree>\n' +
        '                        </div>'
});
//添加分类
var addCategory=new Vue({
    el:"#add-category",
    data:{
        parentName:'',
        category: {
            "parentId":"",
            "name":"",
        }
    },
    methods: {
        addCategory: function () {
            var data =this.category;
            sendPost({
                url: API.getApi(API.insertCategory),
                data: JSON.stringify(data),
                headers: {
                    token: localStorage.getItem(STORAGE_KEY.token)
                },
                success: function (res) {
                    if (res.code == 0) {
                        alert("添加成功！");
                        $("#add-category").modal('toggle');
                        vueDeviceList.sort();

                    } else {
                        console.log(res)
                        alert(res.msg);
                    }
                }
            });
        }
    }

});
//添加地点
var addressVm = new Vue({
    el: "#address-device",
    data: {
        address: {
            "parentId":"",
            "name": "",
        },
        //选项卡数据
        selection: $.extend(true,{},deviceSearchSelection)

    },
    methods: {
        //添加地点
        AddAddress: function () {
            var data = this.address;
            sendPost({
                url: API.getApi(API.AddAddress),
                data: JSON.stringify(data),
                success: function (res) {
                    if (res.code == 0) {
                        alert("添加成功！");
                        $("#address-device").modal('toggle');
                        //刷新设备列表
                        vueDeviceList.addressDevice();
                    } else {
                        alert("添加失败！");
                    }
                }
            });
        },
    }
});
//添加用户
var addUserVm = new Vue({
    el: "#add-user",
    data: {
        user: {
            "username":"",
            "password": "",
            "realName":"",
            "roleId":"",
            "email": "",
            "phone":"",
            "address":""
        },
        //选项卡数据
        roleIds:[
            {
                id: "",
                name: ""
            }
        ],
        pageParam: new defaultQueryPage()
    },
    methods: {
        //添加用户
        addUser: function () {
            var data = this.user;
            sendPost({
                url: API.getApi(API.addUser),
                data: JSON.stringify(data),
                success: function (res) {
                    if (res.code == 0) {
                        alert("添加成功！");
                        $("#add-user").modal('toggle');
                        //刷新用户列表
                        vueDeviceList.ListUser();
                    } else {
                        alert(res.msg);
                    }
                }
            });
        },
        //获取添加用户选项卡数据
        getUserSelection: function () {
            var self = this;
            sendPost({
                url:API.getApi(API.getUserSelection),
                data: JSON.stringify(self.pageParam),
                success: function (res) {
                    if (res.code === 0){
                            self.roleIds=res.data.list;
                    }else {
                        console.error(res.msg);
                    }
                }
            });
        }
    },
    created: function () {
        this.getUserSelection();
    }
});
//添加设备
var addDeviceVm = new Vue({
    el: "#add-device",
    data: {
        device: {
            "amountUnitId": "",
            "brandId": "",
            "categoryIds": [
                ""
            ],
            "deviceModelId": 0,
            "useDepartmentId": 0,
            "custodianId": "",
            "locationId": "",
            "name": "",
            "nationalId": "",
            "serialNumber": "",
            "unitPrice": 0,
            "workNatureId": ""
        },
        //选项卡数据
        selection: $.extend(true,{},deviceSearchSelection)
    },
    methods:{
        //添加设备
        addDevice: function () {
            var data = this.device;
            sendPost({
                url: API.getApi(API.addDevice),
                data: JSON.stringify(data),
                success: function (res) {
                    if (res.code == 0){
                        alert("添加成功！");
                        $("#add-device").modal('toggle');
                        //刷新设备列表
                        vueDeviceList.listDevice();
                    }else {
                        alert(res.msg);
                    }
                }
            });
        },
        //获取添加设备选项卡数据
        getDeviceSelection: function () {
            var self = this;
            sendPost({
                url:API.getApi(API.getDeviceSelection) + "/20",
                success: function (res) {
                    if (res.code === 0){
                        var categoryList = $.extend(true,[],res.data.categoryList);
                        for (var category of categoryList){
                            initCategory(category);
                        }
                        categoryVm.categoryList = categoryList;
                        //渲染选项卡数据
                        self.selection.categoryList = res.data.categoryList;
                        self.selection.brandList = res.data.brandList;
                        self.selection.deviceModelList = res.data.deviceModelList;
                        self.selection.locationList = res.data.locationList;
                        self.selection.workNatureList = res.data.workNatureList;
                        self.selection.custodianList = res.data.custodianList;
                        //选项数据同样给到搜索设备组件中
                        vueDeviceList.searchSelection = $.extend(true,{},res.data);
                        //选项数据复制给分发设备组件
                        deviceModalVm.distributeSelection = $.extend(true,{},res.data);
                    }else {
                        console.error(res.msg);
                    }
                }
            });
        }
    },
    created: function () {
        this.getDeviceSelection();
    }
});
//删除地点
var deleteaddressVm = new Vue({
    el: "#delete-address",
    data: {

    },
    methods: {
        //删除地点
        DeleteAddress: function () {
            var self = this;
            sendPost({
                url: API.getApi(API.DeleteAddress+"/1540262828641833573"),
                data:{

                },
                success: function (res) {
                    if (res.code == 0) {
                        alert("删除成功！");
                        $("#delete-address").modal('toggle');
                        //刷新设备列表
                        vueDeviceList.addressDevice();
                    } else {
                        alert("删除失败！");
                    }
                }
            });
        },
    }
});
//删除用户
var deleteUserVm = new Vue({
    el: "#delete-user",
    data: {
        user:
            {"id": ""}
     },
    methods: {
        deleteUser: function () {
            var data = this.user;
            sendPost({
                url: API.getApi(API.deleteUser)+data.id,
                success: function (res) {
                    if (res.code == 0) {
                        alert("删除成功！");
                        $("#delete-user").modal('toggle');
                        //刷新设备列表
                        vueDeviceList.ListUser();
                    } else {
                        alert("删除失败！");
                    }
                }
            });
        },
    }
});

//侧边栏
var sideBarVm = new Vue({
    el: "#sidebar",
    data: {
        username: getLocalStorage(STORAGE_KEY.userInfo).username,
    },
    methods: {
        listDevice: function (statusId) {
            vueDeviceList.device=true;
            vueDeviceList.category=false;
            vueDeviceList.address=false;
            vueDeviceList.user=false;
            vueDeviceList.isSort=false;
            addresstreeVm.atree=false;
            vueDeviceList.queryParams.statusId = statusId;
            vueDeviceList.listDevice();
            categoryVm.tree=true;
        },
        sortList:function (id) {
            if(id==-1){
                vueDeviceList.showButton=false,
                    vueDeviceList.dataList.parentId="";

            }else {
                vueDeviceList.showButton=true,
                    vueDeviceList.dataList.parentId=id;
            }
            vueDeviceList.sort();
            vueDeviceList.isSort=true;
            vueDeviceList.device=false;
            vueDeviceList.category=true;
            vueDeviceList.address=false;
            vueDeviceList.user=false;
            categoryVm.tree=true;
            addresstreeVm.atree=false;
        },
        addressDevice:function(statusId){
            vueDeviceList.queryParams.statusId = statusId;
            vueDeviceList.addressDevice();
            vueDeviceList.device=false;
            vueDeviceList.address=true;
            vueDeviceList.category=false;
            vueDeviceList.user=false;
            categoryVm.tree=false;
            addresstreeVm.atree=true;
        },
        ListUser:function () {
            vueDeviceList.ListUser();
            vueDeviceList.user=true;
            vueDeviceList.device=false;
            vueDeviceList.address=false;
            vueDeviceList.category=false;
            categoryVm.tree=false;
            addresstreeVm.atree=false;
        }
    }
});
//注销
var logoutVm = new Vue({
    el: "#logout",
    methods: {
        logout: function () {
            localStorage.clear();
            window.location.href = "login.html";
        }
    }
});