import React, { useState } from 'react';

// Mock 数据
const mockCustomers = [
  {
    id: 1,
    name: '上海海洋货运',
    hasRecords: false,
    recordCount: 0
  },
  {
    id: 2,
    name: '北京国际贸易',
    hasRecords: false,
    recordCount: 0
  },
  {
    id: 3,
    name: '广州物流有限公司',
    hasRecords: false,
    recordCount: 0
  }
];

// 销售人员数据
const salesPersons = [
  { id: 1, name: '魏新兰' },
  { id: 2, name: '张明' },
  { id: 3, name: '李华' }
];

function App() {
  const [selectedCustomer, setSelectedCustomer] = useState(mockCustomers[0]);
  const [activeTab, setActiveTab] = useState('follow');
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);
  const [showNewEventModal, setShowNewEventModal] = useState(false);
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [showFollowUpForm, setShowFollowUpForm] = useState({});
  const [currentView, setCurrentView] = useState('customer');
  
  // 筛选状态
  const [filters, setFilters] = useState({
    time: '全部时间',
    eventType: '全部',
    orderStatus: '全部'
  });
  
  const [newOrderForm, setNewOrderForm] = useState({
    orderNumber: '',
    contactPerson: '',
    departurePort: '',
    destinationPort: '',
    cargoType: '',
    tradeTerms: '',
    currentStage: ''
  });
  
  const [newEventForm, setNewEventForm] = useState({
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    type: '',
    salesPersonId: 1,
    orderId: '',
    note: ''
  });

  // 处理标签页切换
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // 处理新建跟单弹窗
  const handleNewOrder = () => {
    setShowNewOrderModal(true);
  };

  // 处理新建事件弹窗
  const handleNewEvent = () => {
    setShowNewEventModal(true);
  };

  // 处理表单输入变化
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setNewOrderForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 处理事件表单输入变化
  const handleEventFormChange = (e) => {
    const { name, value } = e.target;
    setNewEventForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 处理筛选变化
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 生成订单ID
  const generateOrderId = () => {
    return 'OP-' + Date.now();
  };

  // 生成事件ID
  const generateEventId = () => {
    return 'EV-' + Date.now();
  };

  // 处理保存新订单
  const handleSaveNewOrder = (e) => {
    e.preventDefault();
    
    const newOrder = {
      id: generateOrderId(),
      customerId: selectedCustomer.id,
      name: newOrderForm.orderNumber || `订单-${orders.length + 1}`,
      contactPerson: newOrderForm.contactPerson,
      departurePort: newOrderForm.departurePort,
      destinationPort: newOrderForm.destinationPort,
      cargoType: newOrderForm.cargoType,
      tradeTerms: newOrderForm.tradeTerms,
      status: newOrderForm.currentStage || '线索',
      date: new Date().toISOString().split('T')[0],
      lastFollowTime: '刚刚',
      timeline: []
    };
    
    const updatedOrders = [newOrder, ...orders];
    setOrders(updatedOrders);
    setFilteredOrders(updatedOrders.filter(order => order.customerId === selectedCustomer.id));
    setShowNewOrderModal(false);
    
    // 重置表单
    setNewOrderForm({
      orderNumber: '',
      contactPerson: '',
      departurePort: '',
      destinationPort: '',
      cargoType: '',
      tradeTerms: '',
      currentStage: ''
    });
    
    // 提示用户创建首次跟进记录
    if (window.confirm('订单创建成功！是否为该订单创建首次跟进记录？')) {
      // 预填事件表单，自动关联到新创建的订单
      setNewEventForm({
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
        type: '📞 电话沟通',
        salesPersonId: 1,
        orderId: newOrder.id,
        note: `创建订单: ${newOrder.name}`
      });
      setShowNewEventModal(true);
    }
  };

  // 处理保存新事件
  const handleSaveNewEvent = (e) => {
    e.preventDefault();
    // 获取订单信息
    const order = newEventForm.orderId ? orders.find(o => o.id === newEventForm.orderId) : null;
    // 生成新事件
    const newEvent = {
      id: generateEventId(),
      customerId: selectedCustomer.id,
      date: newEventForm.date,
      time: newEventForm.time,
      type: newEventForm.type,
      salesPersonId: newEventForm.salesPersonId,
      salesPersonName: salesPersons.find(sp => sp.id === parseInt(newEventForm.salesPersonId)).name,
      orderId: newEventForm.orderId,
      orderName: order ? order.name : '',
      note: newEventForm.note
    };
    const updatedEvents = [newEvent, ...events];
    setEvents(updatedEvents);
    // 根据当前选中的客户过滤事件
    setFilteredEvents(updatedEvents.filter(event => event.customerId === selectedCustomer.id));
    
    setShowNewEventModal(false);
    // 重置表单
    setNewEventForm({
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      type: '',
      salesPersonId: 1,
      orderId: '',
      note: ''
    });
  };

  // 处理保存跟进记录
  const handleSaveFollowUp = (orderId, followUpData) => {
    // 获取订单信息
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    // 生成新事件
    const newEvent = {
      id: generateEventId(),
      customerId: selectedCustomer.id,
      date: followUpData.date,
      time: followUpData.time,
      type: followUpData.method,
      salesPersonId: 1,
      salesPersonName: '魏新兰',
      orderId: order.id,
      orderName: order.name,
      note: followUpData.note
    };
    
    const updatedEvents = [newEvent, ...events];
    setEvents(updatedEvents);
    // 根据当前选中的客户过滤事件
    setFilteredEvents(updatedEvents.filter(event => event.customerId === selectedCustomer.id));
    
    // 更新订单状态
    const updatedOrders = orders.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          status: followUpData.status
        };
      }
      return o;
    });
    setOrders(updatedOrders);
    // 根据当前选中的客户过滤订单
    setFilteredOrders(updatedOrders.filter(o => o.customerId === selectedCustomer.id));
    
    // 保存后隐藏表单
    setShowFollowUpForm(prev => ({
      ...prev,
      [orderId]: false
    }));
  };

  // 处理删除跟进记录
  const handleDeleteFollowUp = (orderId, index) => {
    setOrders(orders.map(order => {
      if (order.id === orderId) {
        const newTimeline = [...order.timeline];
        newTimeline.splice(index, 1);
        return {
          ...order,
          timeline: newTimeline
        };
      }
      return order;
    }));
  };

  // 处理删除订单
  const handleDeleteOrder = (orderId) => {
    if (window.confirm('确定要删除这个订单吗？')) {
      const updatedOrders = orders.filter(order => order.id !== orderId);
      setOrders(updatedOrders);
      setFilteredOrders(updatedOrders.filter(order => order.customerId === selectedCustomer.id));
    }
  };

  // 处理删除事件
  const handleDeleteEvent = (eventId) => {
    if (window.confirm('确定要删除这个事件吗？')) {
      const updatedEvents = events.filter(event => event.id !== eventId);
      setEvents(updatedEvents);
      setFilteredEvents(updatedEvents.filter(event => event.customerId === selectedCustomer.id));
    }
  };

  // 处理订单展开/折叠
  const toggleOrder = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  // 处理显示/隐藏跟进表单
  const toggleFollowUpForm = (orderId) => {
    setShowFollowUpForm(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
    // 确保订单是展开状态
    if (expandedOrder !== orderId) {
      setExpandedOrder(orderId);
    }
  };

  // 应用事件筛选
  const applyEventFilters = () => {
    let result = events.filter(event => event.customerId === selectedCustomer.id);
    
    // 时间筛选
    if (filters.time !== '全部时间') {
      const now = new Date();
      let days = 7;
      if (filters.time === '最近30天') days = 30;
      if (filters.time === '最近90天') days = 90;
      
      const cutoffDate = new Date();
      cutoffDate.setDate(now.getDate() - days);
      
      result = result.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate >= cutoffDate;
      });
    }

    // 事件类型筛选
    if (filters.eventType !== '全部') {
      result = result.filter(event => event.type === filters.eventType);
    }

    // 订单状态筛选
    if (filters.orderStatus !== '全部') {
      result = result.filter(event => {
        if (!event.orderId) return false;
        const order = orders.find(o => o.id === event.orderId);
        return order && order.status === filters.orderStatus;
      });
    }

    setFilteredEvents(result);
  };

  // 应用订单筛选
  const applyOrderFilters = () => {
    let result = orders.filter(order => order.customerId === selectedCustomer.id);
    
    // 时间筛选
    if (filters.time !== '全部时间') {
      const now = new Date();
      let days = 7;
      if (filters.time === '最近30天') days = 30;
      if (filters.time === '最近90天') days = 90;
      
      const cutoffDate = new Date();
      cutoffDate.setDate(now.getDate() - days);
      
      result = result.filter(order => {
        const orderDate = new Date(order.date);
        return orderDate >= cutoffDate;
      });
    }

    setFilteredOrders(result);
  };

  // 处理客户切换
  const handleCustomerChange = (customer) => {
    setSelectedCustomer(customer);
    // 过滤当前客户的订单
    setFilteredOrders(orders.filter(order => order.customerId === customer.id));
    // 过滤当前客户的事件
    setFilteredEvents(events.filter(event => event.customerId === customer.id));
  };

  // 重置筛选
  const resetFilters = () => {
    setFilters({
      time: '全部时间',
      eventType: '全部',
      orderStatus: '全部'
    });
    // 重置时也需要考虑客户ID
    setFilteredOrders(orders.filter(order => order.customerId === selectedCustomer.id));
    setFilteredEvents(events.filter(event => event.customerId === selectedCustomer.id));
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* 左侧导航栏 */}
      <div className="w-48 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-primary">CRM</h1>
        </div>
        <nav className="flex-1 p-4">
          <ul className="space-y-4">
            <li>
              <a 
                href="#" 
                className={`flex items-center gap-2 ${currentView === 'customer' ? 'text-primary font-medium' : 'text-gray-600 hover:text-primary'}`}
                onClick={() => setCurrentView('customer')}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                客户管理
              </a>
            </li>
            <li>
              <a 
                href="#" 
                className={`flex items-center gap-2 ${currentView === 'dashboard' ? 'text-primary font-medium' : 'text-gray-600 hover:text-primary'}`}
                onClick={() => setCurrentView('dashboard')}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                绩效看板
              </a>
            </li>
          </ul>
        </nav>
      </div>

      {currentView === 'customer' && (
        <>
          {/* 中间客户列表 */}
          <div className="w-64 bg-white border-r border-gray-200 p-4 overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">客户列表</h2>
            <ul className="space-y-2">
              {mockCustomers.map(customer => (
                <li key={customer.id}>
                  <div 
                    className={`flex items-center justify-between p-2 rounded cursor-pointer ${selectedCustomer.id === customer.id ? 'bg-lightBlue' : 'hover:bg-gray-100'}`}
                    onClick={() => handleCustomerChange(customer)}
                  >
                    <span>{customer.name}</span>
                    {customer.hasRecords ? (
                      <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full">
                        {customer.recordCount}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-xs">暂无交易</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* 右侧内容区 */}
          <div className="flex-1 flex flex-col">
            {/* 顶部搜索栏 */}
            <div className="h-16 bg-white border-b border-gray-200 flex items-center px-6">
              <div className="relative w-64">
                <input
                  type="text"
                  placeholder="Search"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* 客户详情区 */}
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                  <h1 className="text-2xl font-bold">{selectedCustomer.name} - 客户详情</h1>
                  <button 
                    className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90"
                    onClick={handleNewOrder}
                  >
                    + 新建订单
                  </button>
                </div>
                
                {/* 标签页切换 */}
                <div className="flex border-b border-gray-200 mb-6">
                  <button 
                    className={`px-4 py-2 ${activeTab === 'basic' ? 'border-b-2 border-primary text-primary font-medium' : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => handleTabChange('basic')}
                  >
                    基本信息
                  </button>
                  <button 
                    className={`px-4 py-2 ${activeTab === 'follow' ? 'border-b-2 border-primary text-primary font-medium' : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => handleTabChange('follow')}
                  >
                    跟单日志
                  </button>
                  <button 
                    className={`px-4 py-2 ${activeTab === 'events' ? 'border-b-2 border-primary text-primary font-medium' : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => handleTabChange('events')}
                  >
                    所有事件
                  </button>
                </div>

                {/* 基本信息 */}
                {activeTab === 'basic' && (
                  <div>
                    <h2 className="text-lg font-semibold mb-4">基本信息</h2>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">公司名称</p>
                        <p className="font-medium">{selectedCustomer.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">联系人</p>
                        <p className="font-medium">张三</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">联系电话</p>
                        <p className="font-medium">138-0000-0000</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">邮箱</p>
                        <p className="font-medium">contact@example.com</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 跟单日志 */}
                {activeTab === 'follow' && (
                  <div>
                    <div className="mb-8">
                      <h3 className="text-lg font-semibold mb-4">订单列表</h3>
                      {filteredOrders.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                          暂无订单
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {filteredOrders.map(order => (
                            <div key={order.id} className="border border-gray-200 rounded-lg overflow-hidden">
                              {/* 订单摘要条 */}
                              <div 
                                className="bg-blue-50 p-4 flex justify-between items-center border-l-4 border-primary rounded-r-md"
                              >
                                <div className="flex items-start gap-4">
                                  <div 
                                    className="text-gray-500 cursor-pointer mt-1"
                                    onClick={() => toggleOrder(order.id)}
                                  >
                                    {expandedOrder === order.id ? '▼' : '▶'}
                                  </div>
                                  <div>
                                    <h3 className="font-medium text-lg">#{order.id} {order.name}</h3>
                                    <div className="flex flex-wrap gap-3 mt-1">
                                      <span className="text-sm text-gray-600">{order.cargoType}</span>
                                      <span className="text-sm text-gray-600">·</span>
                                      <span className={`text-sm px-2 py-0.5 rounded-full ${order.status === '待处理' ? 'bg-blue-100 text-blue-800' : order.status === '进行中' ? 'bg-purple-100 text-purple-800' : order.status === '已完成' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                        {order.status}
                                      </span>
                                      <span className="text-sm text-gray-600">·</span>
                                      <span className="text-sm text-gray-600">最后跟进: {order.lastFollowTime}</span>
                                    </div>
                                    <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-500">
                                      {order.contactPerson && <span>关联人员: {order.contactPerson}</span>}
                                      {order.tradeTerms && <span>贸易条款: {order.tradeTerms}</span>}
                                      <span>起运港: {order.departurePort}</span>
                                      <span>目的地: {order.destinationPort}</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <button 
                                    className="bg-primary text-white px-3 py-1 rounded-md hover:bg-primary/90 text-sm"
                                    onClick={() => toggleFollowUpForm(order.id)}
                                  >
                                    新建跟进记录
                                  </button>
                                  <button 
                                    className="text-red-500 hover:text-red-700 text-sm"
                                    onClick={() => handleDeleteOrder(order.id)}
                                  >
                                    删除
                                  </button>
                                </div>
                              </div>

                              {/* 展开内容 */}
                              {expandedOrder === order.id && (
                                <div className="p-4 border-t border-gray-200">
                                  {/* 极速录入表单 */}
                                  {showFollowUpForm[order.id] && (
                                    <div className="mb-6">
                                      <OrderForm 
                                        orderId={order.id} 
                                        onSave={handleSaveFollowUp} 
                                      />
                                    </div>
                                  )}

                                  {/* 关联的跟进事件 */}
                                  <div>
                                    <h4 className="font-medium mb-3">关联跟进事件</h4>
                                    {events.filter(event => event.orderId === order.id).length === 0 ? (
                                      <p className="text-gray-500 text-sm">暂无关联的跟进事件</p>
                                    ) : (
                                      <div className="space-y-3">
                                        {events.filter(event => event.orderId === order.id).map(event => (
                                          <div key={event.id} className="p-3 border border-gray-100 rounded-md hover:bg-gray-50">
                                            <div className="flex items-center gap-2 mb-1">
                                              <span className="font-medium">{event.type}</span>
                                            </div>
                                            <p className="text-sm text-gray-600 mb-1">{event.note}</p>
                                            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                                              <span>日期: {event.date} {event.time}</span>
                                              <span>销售人员: {event.salesPersonName}</span>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* 新建跟单按钮 */}
                    <div className="mt-8 flex justify-end">
                      <button 
                        className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200"
                        onClick={handleNewOrder}
                      >
                        + 新建跟单
                      </button>
                    </div>
                  </div>
                )}

                {/* 所有事件 */}
                {activeTab === 'events' && (
                  <div>
                    {/* 筛选功能 */}
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                      <h3 className="text-lg font-semibold mb-4">筛选条件</h3>
                      <div className="flex flex-wrap gap-4 items-center">
                        <div className="flex items-center gap-2">
                          <label className="text-sm text-gray-500">时间</label>
                          <select 
                            name="time"
                            value={filters.time}
                            onChange={handleFilterChange}
                            className="border border-gray-300 rounded-md px-3 py-1 text-sm w-32"
                          >
                            <option>全部时间</option>
                            <option>最近7天</option>
                            <option>最近30天</option>
                            <option>最近90天</option>
                          </select>
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="text-sm text-gray-500">事件类型</label>
                          <select 
                            name="eventType"
                            value={filters.eventType}
                            onChange={handleFilterChange}
                            className="border border-gray-300 rounded-md px-3 py-1 text-sm w-32"
                          >
                            <option>全部</option>
                            <option>📞 电话沟通</option>
                            <option>💻 线上会议</option>
                            <option>🤝 上门拜访</option>
                            <option>✉️ 邮件</option>
                            <option>📊 报价</option>
                            <option>📋 合同签署</option>
                          </select>
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="text-sm text-gray-500">订单状态</label>
                          <select 
                            name="orderStatus"
                            value={filters.orderStatus}
                            onChange={handleFilterChange}
                            className="border border-gray-300 rounded-md px-3 py-1 text-sm w-32"
                          >
                            <option value="全部">全部</option>
                            <option value="线索">线索</option>
                            <option value="接触">接触</option>
                            <option value="报价">报价</option>
                            <option value="成交/活跃 (正在走货)">成交/活跃 (正在走货)</option>
                            <option value="流失">流失</option>
                          </select>
                        </div>
                        <button 
                          onClick={applyEventFilters}
                          className="bg-primary text-white px-4 py-1 rounded-md hover:bg-primary/90 text-sm"
                        >
                          确定
                        </button>
                        <button 
                          onClick={resetFilters}
                          className="border border-gray-300 px-4 py-1 rounded-md hover:bg-gray-50 text-sm"
                        >
                          重置
                        </button>
                      </div>
                    </div>

                    {/* 事件列表 */}
                    <div className="mb-8">
                      <h3 className="text-lg font-semibold mb-4">所有跟进事件</h3>
                      {filteredEvents.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                          暂无跟进事件
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {filteredEvents.map(event => (
                            <div key={event.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow bg-white">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="flex flex-wrap items-center gap-2 mb-3">
                                    <h4 className="font-medium text-lg">{event.type}</h4>
                                    {event.orderId && (
                                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-800">
                                        订单: {event.orderName}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-600 mb-3">{event.note}</p>
                                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                                    <span className="flex items-center gap-1">
                                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                      </svg>
                                      {event.date} {event.time}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                      </svg>
                                      {event.salesPersonName}
                                    </span>
                                    {event.orderId && (
                                      <span className="flex items-center gap-1">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                        </svg>
                                        订单: #{event.orderId}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <button 
                                  className="text-red-500 hover:text-red-700 text-sm ml-4"
                                  onClick={() => handleDeleteEvent(event.id)}
                                >
                                  删除
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {currentView === 'dashboard' && (
        <DashboardView 
          events={events} 
          orders={orders} 
          salesPersons={salesPersons}
        />
      )}

      {/* 新建跟单弹窗 */}
      {showNewOrderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-96 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">新建跟单</h3>
              <button 
                className="text-gray-400 hover:text-gray-600"
                onClick={() => setShowNewOrderModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSaveNewOrder} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">订单编号</label>
                  <input
                    type="text"
                    name="orderNumber"
                    value={newOrderForm.orderNumber}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">关联人员 *</label>
                  <input
                    type="text"
                    name="contactPerson"
                    value={newOrderForm.contactPerson}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">起运港 *</label>
                  <input
                    type="text"
                    name="departurePort"
                    value={newOrderForm.departurePort}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">目的地 *</label>
                  <input
                    type="text"
                    name="destinationPort"
                    value={newOrderForm.destinationPort}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">货物类型</label>
                <input
                  type="text"
                  name="cargoType"
                  value={newOrderForm.cargoType}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">贸易条款</label>
                <input
                  type="text"
                  name="tradeTerms"
                  value={newOrderForm.tradeTerms}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">当前阶段 *</label>
                <input
                  type="text"
                  name="currentStage"
                  value={newOrderForm.currentStage}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  onClick={() => setShowNewOrderModal(false)}
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
                >
                  保存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 新建事件弹窗 */}
      {showNewEventModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-96 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">新建跟进事件</h3>
              <button 
                className="text-gray-400 hover:text-gray-600"
                onClick={() => setShowNewEventModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSaveNewEvent} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">日期 *</label>
                  <input
                    type="date"
                    name="date"
                    value={newEventForm.date}
                    onChange={handleEventFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">时间 *</label>
                  <input
                    type="time"
                    name="time"
                    value={newEventForm.time}
                    onChange={handleEventFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">事件类型 *</label>
                <select
                  name="type"
                  value={newEventForm.type}
                  onChange={handleEventFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="">请选择</option>
                  <option value="📞 电话沟通">📞 电话沟通</option>
                  <option value="💻 线上会议">💻 线上会议</option>
                  <option value="🤝 上门拜访">🤝 上门拜访</option>
                  <option value="✉️ 邮件">✉️ 邮件</option>
                  <option value="📊 报价">📊 报价</option>
                  <option value="📋 合同签署">📋 合同签署</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">销售人员 *</label>
                <select
                  name="salesPersonId"
                  value={newEventForm.salesPersonId}
                  onChange={handleEventFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  {salesPersons.map(person => (
                    <option key={person.id} value={person.id}>{person.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">关联订单</label>
                {newEventForm.orderId ? (
                  <input
                    type="text"
                    value={`#${newEventForm.orderId} ${orders.find(o => o.id === newEventForm.orderId)?.name || ''}`}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                  />
                ) : (
                  <select
                    name="orderId"
                    value={newEventForm.orderId}
                    onChange={handleEventFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  >
                    <option value="">请选择订单</option>
                    {orders.filter(order => order.customerId === selectedCustomer.id).map(order => (
                      <option key={order.id} value={order.id}>#{order.id} {order.name}</option>
                    ))}
                  </select>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">备注 *</label>
                <textarea
                  name="note"
                  value={newEventForm.note}
                  onChange={handleEventFormChange}
                  placeholder="请输入事件详情..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  onClick={() => setShowNewEventModal(false)}
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
                >
                  保存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// 极速录入表单组件
function OrderForm({ orderId, onSave }) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    method: '',
    status: '线索',
    note: '',
    person: '魏新兰'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    onSave(orderId, formData);
  };

  return (
    <form onSubmit={handleSave} className="space-y-4">
      <div className="grid grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">日期</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">跟进方式</label>
          <select
            name="method"
            value={formData.method}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            required
          >
            <option value="">请选择</option>
            <option value="📞 电话沟通">📞 电话沟通</option>
            <option value="💻 线上会议">💻 线上会议</option>
            <option value="🤝 上门拜访">🤝 上门拜访</option>
            <option value="✉️ 邮件">✉️ 邮件</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">订单状态</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            required
          >
            <option value="">请选择</option>
            <option value="线索">线索</option>
            <option value="接触">接触</option>
            <option value="报价">报价</option>
            <option value="成交/活跃 (正在走货)">成交/活跃 (正在走货)</option>
            <option value="流失">流失</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">备注</label>
          <input
            type="text"
            name="note"
            value={formData.note}
            onChange={handleChange}
            placeholder="输入核心结论..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>
      </div>
      <div className="flex gap-3 justify-end">
        <button
          type="submit"
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
        >
          保存
        </button>
      </div>
    </form>
  );
}

// 动态时间轴组件
function Timeline({ data, onDelete }) {
  if (data.length === 0) {
    return <p className="text-gray-500 text-sm">暂无跟进记录</p>;
  }

  return (
    <div className="space-y-4">
      {data.map((item, index) => (
        <div key={index} className="flex gap-4 p-3 border border-gray-100 rounded-md hover:bg-gray-50">
          <div className="w-32 flex-shrink-0">
            <div className="text-sm font-medium">{item.date} | {item.time}</div>
            <div className="text-xs text-gray-500">{item.person}</div>
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium mb-1">{item.method}</div>
            <div className="text-sm text-gray-600">{item.note}</div>
          </div>
          <div className="flex-shrink-0">
            <button 
              className="text-red-500 hover:text-red-700"
              onClick={() => onDelete(index)}
            >
              删除
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// 绩效看板组件
function DashboardView({ events, orders, salesPersons }) {
  // 计算统计数据
  const thisWeekEvents = events.filter(e => {
    const eventDate = new Date(e.date);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return eventDate >= weekAgo;
  });

  const quotationOrders = orders.filter(o => o.status === '报价').length;
  const overdueOrders = orders.filter(o => {
    const orderDate = new Date(o.date);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return orderDate < weekAgo && o.status !== '成交/活跃 (正在走货)';
  }).length;

  // 计算销售人员积分
  const salesPoints = salesPersons.map(person => {
    const personEvents = events.filter(e => e.salesPersonId === person.id);
    const points = personEvents.reduce((sum, e) => {
      if (e.type === '🤝 上门拜访') return sum + 5;
      if (e.type === '💻 线上会议') return sum + 3;
      if (e.type === '📞 电话沟通') return sum + 2;
      return sum + 1;
    }, 0);
    return { ...person, points, eventCount: personEvents.length };
  }).sort((a, b) => b.points - a.points);

  // 计算漏斗数据
  const funnelData = {
    线索: orders.filter(o => o.status === '线索').length,
    接触: orders.filter(o => o.status === '接触').length,
    报价: orders.filter(o => o.status === '报价').length,
    成交: orders.filter(o => o.status === '成交/活跃 (正在走货)').length,
  };

  // 低质量跟进记录
  const lowQualityEvents = events.filter(e => {
    const isPhoneOnly = e.type === '📞 电话沟通';
    const isShortNote = e.note && e.note.length < 10;
    return isPhoneOnly && isShortNote;
  }).slice(0, 5);

  return (
    <div className="flex-1 bg-gray-50 p-6 overflow-y-auto">
      {/* 页面标题 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">📊 绩效看板</h1>
        <p className="text-gray-500 mt-1">销售团队事件跟进KPI监控中心</p>
      </div>

      {/* 顶部核心数据概览 */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        {/* 本周总跟进次数 */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm mb-1">本周总跟进次数</p>
              <p className="text-4xl font-bold">{thisWeekEvents.length}</p>
            </div>
            <div className="bg-white/20 p-3 rounded-lg">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-300">↑ 12%</span>
            <span className="text-blue-100 ml-2">较上周</span>
          </div>
        </div>

        {/* 转化报价单数 */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm mb-1">转化报价单数</p>
              <p className="text-4xl font-bold">{quotationOrders}</p>
            </div>
            <div className="bg-white/20 p-3 rounded-lg">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-300">↑ 8%</span>
            <span className="text-purple-100 ml-2">较上周</span>
          </div>
        </div>

        {/* 逾期预警数 */}
        <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm mb-1">逾期预警数</p>
              <p className="text-4xl font-bold">{overdueOrders}</p>
            </div>
            <div className="bg-white/20 p-3 rounded-lg">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-red-200">需关注</span>
            <span className="text-orange-100 ml-2">超过7天未成交</span>
          </div>
        </div>
      </div>

      {/* 中间区域：龙虎榜 & 漏斗 */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        {/* 团队勤奋度积分排行榜 */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-800">🏆 团队勤奋度积分排行榜</h3>
            <span className="text-sm text-gray-500">本周统计</span>
          </div>
          <div className="space-y-4">
            {salesPoints.map((person, index) => (
              <div key={person.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  index === 0 ? 'bg-yellow-400 text-yellow-900' :
                  index === 1 ? 'bg-gray-300 text-gray-700' :
                  index === 2 ? 'bg-orange-300 text-orange-800' :
                  'bg-gray-200 text-gray-600'
                }`}>
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-800">{person.name}</span>
                    <span className="text-primary font-bold">{person.points} 分</span>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                    <span>跟进 {person.eventCount} 次</span>
                    <span>平均 {person.eventCount > 0 ? (person.points / person.eventCount).toFixed(1) : 0} 分/次</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 销售转化漏斗 */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-800">🎯 销售转化漏斗</h3>
            <span className="text-sm text-gray-500">实时数据</span>
          </div>
          <div className="space-y-3">
            {/* 线索 */}
            <div className="relative">
              <div className="bg-blue-100 rounded-lg p-4" style={{ width: '100%' }}>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-blue-800">线索</span>
                  <span className="text-2xl font-bold text-blue-600">{funnelData.线索}</span>
                </div>
              </div>
            </div>
            {/* 接触 */}
            <div className="relative flex justify-center">
              <div className="bg-indigo-100 rounded-lg p-4" style={{ width: '85%' }}>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-indigo-800">接触</span>
                  <span className="text-2xl font-bold text-indigo-600">{funnelData.接触}</span>
                </div>
                <div className="text-xs text-indigo-500 mt-1">
                  转化率 {funnelData.线索 > 0 ? ((funnelData.接触 / funnelData.线索) * 100).toFixed(1) : 0}%
                </div>
              </div>
            </div>
            {/* 报价 */}
            <div className="relative flex justify-center">
              <div className="bg-purple-100 rounded-lg p-4" style={{ width: '70%' }}>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-purple-800">报价</span>
                  <span className="text-2xl font-bold text-purple-600">{funnelData.报价}</span>
                </div>
                <div className="text-xs text-purple-500 mt-1">
                  转化率 {funnelData.接触 > 0 ? ((funnelData.报价 / funnelData.接触) * 100).toFixed(1) : 0}%
                </div>
              </div>
            </div>
            {/* 成交 */}
            <div className="relative flex justify-center">
              <div className="bg-green-100 rounded-lg p-4" style={{ width: '55%' }}>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-green-800">成交</span>
                  <span className="text-2xl font-bold text-green-600">{funnelData.成交}</span>
                </div>
                <div className="text-xs text-green-500 mt-1">
                  转化率 {funnelData.报价 > 0 ? ((funnelData.成交 / funnelData.报价) * 100).toFixed(1) : 0}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 底部：异常跟进抽查 */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-800">⚠️ 异常跟进抽查</h3>
          <span className="text-sm text-red-500 font-medium">低质量跟进记录</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">销售人员</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">事件类型</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">客户/订单</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">备注内容</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">跟进时间</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">问题类型</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {lowQualityEvents.length > 0 ? (
                lowQualityEvents.map((event, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">{event.salesPersonName}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{event.type}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{event.orderName || '无关联订单'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">{event.note}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{event.date} {event.time}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-red-100 text-red-600 text-xs rounded-full">
                        备注过短
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                    暂无异常跟进记录，团队跟进质量良好！
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default App;