import React, { useState } from 'react';
import {
  FormOutlined,
  PieChartOutlined,
  UserOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Layout, Menu, theme, Dropdown, Flex, Avatar, ConfigProvider, App } from 'antd';
import { Outlet, useNavigate } from 'react-router';
import { useAppDispatch, useAppSelector } from '@/redux/hook';
import { postLogout } from '@/redux/admin/auth.slice';

const { Header, Content, Footer, Sider } = Layout;

type MenuItem = Required<MenuProps>['items'][number];

function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[],
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
  } as MenuItem;
}

const menu: MenuItem[] = [
  getItem('Dashboard', '/admin', <PieChartOutlined />),
  getItem('Người dùng', 'Customer', <UserOutlined />, [
    getItem('Danh sách người dùng', 'customer', <UserOutlined />),
  ]),
  getItem('Thương hiệu', 'Brand', <FormOutlined />, [
    getItem('Danh sách thương hiệu', 'brand', <FormOutlined />),
  ]),
  getItem('Thể loại', 'Categories', <FormOutlined />, [
    getItem('Danh sách thể loại', 'categories', <FormOutlined />),
  ]),
  getItem('Sản phẩm', 'Product', <FormOutlined />, [
    getItem('Danh sách sản phẩm', 'product', <FormOutlined />),
    getItem('Tạo mới sản phẩm', 'product/create', <FormOutlined />),
  ]),
];


const AdminLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const avatar = useAppSelector(state => state.auth.user.avatar);
  const dispath = useAppDispatch();
  const items: MenuItem[] = [
    {
      key: 'profile',
      label: 'Profile',
      icon: <UserOutlined />,
      onClick: () => console.log('profile'),
    },
    {
      key: 'logout',
      label: 'Logout',
      icon: <FormOutlined />,
      onClick: () => handleLogout(),
    },
  ]
  const handleLogout = () => {
    dispath(postLogout());
    navigate('/admin/login');
  }
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const navigate = useNavigate();
  const onClick: MenuProps['onClick'] = (e) => {
    navigate(e.key);
    console.log('click ', e);
  }

  return (
    <ConfigProvider>
      <App>
        <Layout style={{ minHeight: '100vh' }}>
          <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
            <div className="demo-logo-vertical">
              <img src="https://gw.alipayobjects.com/zos/antfincdn/PmY%24TNNDBI/logo.svg" alt="logo" style={{ width: "50px" }} />
            </div>
            <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline" items={menu} onClick={onClick} />
          </Sider>
          <Layout>
            <Header style={{ padding: 0, background: colorBgContainer }}>
              <Flex justify='flex-end' style={{ marginRight: "50px" }}>
                <Dropdown menu={{ items }} trigger={['click']}>
                  <a className="ant-dropdown-link" onClick={(e) => e.preventDefault()}>
                    <Avatar
                      style={{ border: "1px solid #333333", width: "35px", height: "35px" }}
                      src={avatar}
                      icon={<UserOutlined />}
                    />
                  </a>
                </Dropdown>
              </Flex>
            </Header>
            <Content style={{ margin: '0 16px' }}>
              <Outlet />
            </Content>
            <Footer style={{ textAlign: 'center' }}>
              ©{new Date().getFullYear()} Created by Mr Binh
            </Footer>
          </Layout>
        </Layout>
      </App>
    </ConfigProvider>
  );
};

export default AdminLayout;