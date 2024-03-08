import React, { Suspense, useEffect, useRef, useState } from 'react';
import { SearchOutlined, CheckOutlined, CloseOutlined, HomeOutlined, UserOutlined } from '@ant-design/icons';
import type { GetRef, TableColumnsType, TableColumnType } from 'antd';
import { Breadcrumb, Button, Flex, Input, Space, Switch, Table, message } from 'antd';
import type { FilterDropdownProps } from 'antd/es/table/interface';
import Highlighter from 'react-highlight-words';
import { ICustomer } from '@interface/admin.customer';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { changeCustomerStatus, fetchAllCustomer } from '@services/admin/customer.service';
import { Link } from 'react-router-dom';
import CustomerModal from '@components/admin/customer/customer.modal';

type InputRef = GetRef<typeof Input>;

type DataIndex = keyof ICustomer;

const Customer = () => {
    const [searchText, setSearchText] = useState('');
    const [searchedColumn, setSearchedColumn] = useState('');
    const [page, setPage] = useState<number>(1);
    const [limit, setLimit] = useState<number>(10);
    const [open, setOpen] = useState<boolean>(false);
    const searchInput = useRef<InputRef>(null);
    const [messageApi, contextHolder] = message.useMessage();
    const queryClient = useQueryClient();
    const { isPending, error, data: customer } = useQuery({
        queryKey: ['fetchCustomer', page],
        queryFn: async () => await fetchAllCustomer(page, limit),
        placeholderData: keepPreviousData,
    })
    const mutation = useMutation({
        mutationFn: async (id: number) => await changeCustomerStatus(id),
        onSuccess: () => {
            messageApi.success('Cập nhật trạng thái thành công');
            queryClient.invalidateQueries({ queryKey: ["fetchCustomer"] });
        },
        onError: () => {
            messageApi.error('An error has occurred');
        },
    })

    useEffect(() => {
        if (error) {
            messageApi.error('An error has occurred: ' + error.message);
        }
    }, [error, messageApi]);

    const handleSearch = (
        selectedKeys: string[],
        confirm: FilterDropdownProps['confirm'],
        dataIndex: DataIndex,
    ) => {
        confirm();
        setSearchText(selectedKeys[0]);
        setSearchedColumn(dataIndex);
    };

    const handleReset = (clearFilters: () => void) => {
        clearFilters();
        setSearchText('');
    };

    const getColumnSearchProps = (dataIndex: DataIndex): TableColumnType<ICustomer> => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
            <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
                <Input
                    ref={searchInput}
                    placeholder={`Search ${dataIndex}`}
                    value={selectedKeys[0]}
                    onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
                    style={{ marginBottom: 8, display: 'block' }}
                />
                <Space>
                    <Button
                        type="primary"
                        onClick={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
                        icon={<SearchOutlined />}
                        size="small"
                        style={{ width: 90 }}
                    >
                        Search
                    </Button>
                    <Button
                        onClick={() => clearFilters && handleReset(clearFilters)}
                        size="small"
                        style={{ width: 90 }}
                    >
                        Reset
                    </Button>
                    <Button
                        type="link"
                        size="small"
                        onClick={() => {
                            confirm({ closeDropdown: false });
                            setSearchText((selectedKeys as string[])[0]);
                            setSearchedColumn(dataIndex);
                        }}
                    >
                        Filter
                    </Button>
                    <Button
                        type="link"
                        size="small"
                        onClick={() => {
                            close();
                        }}
                    >
                        close
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: (filtered: boolean) => (
            <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />
        ),
        onFilter: (value, record) =>
            record[dataIndex]
                .toString()
                .toLowerCase()
                .includes((value as string).toLowerCase()),
        onFilterDropdownOpenChange: (visible) => {
            if (visible) {
                setTimeout(() => searchInput.current?.select(), 100);
            }
        },
        render: (text) =>
            searchedColumn === dataIndex ? (
                <Highlighter
                    highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                    searchWords={[searchText]}
                    autoEscape
                    textToHighlight={text ? text.toString() : ''}
                />
            ) : (
                text
            ),
    });

    const columns: TableColumnsType<ICustomer> = [
        {
            title: 'Tên',
            dataIndex: 'name',
            key: 'name',
            width: '30%',
            ...getColumnSearchProps('name'),
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            width: '20%',
            ...getColumnSearchProps('email'),
        },
        {
            title: 'Ảnh đại diện',
            dataIndex: 'avatar',
            key: 'avatar',
            render: (avatar: string) => <img src={avatar} alt="avatar" style={{ width: '50px' }} />
        },
        {
            title: 'Quyền hạn',
            dataIndex: 'role',
            key: 'role',
            ...getColumnSearchProps('role'),
            sorter: (a, b) => a.role.length - b.role.length,
            sortDirections: ['descend', 'ascend'],
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            render: (_, record: { id: number, is_active: boolean }) =>

                <Switch
                    checkedChildren={<CheckOutlined />}
                    unCheckedChildren={<CloseOutlined />}
                    checked={record.is_active}
                    loading={mutation.isPending}
                    onChange={() => handleChangeSatus(record.id)}
                />

        },
    ];
    const handleChangeSatus = (id: number) => {
        mutation.mutate(id);
    };

   

    return (
        <>
            {contextHolder}
            <Breadcrumb
                style={{ margin: '16px 0' }}
                items={[
                    {
                        title: <Link to="/admin"><HomeOutlined /> Dashboard</Link>,
                    },
                    {
                        title: (
                            <>
                                <UserOutlined />
                                <span>Customer List</span>
                            </>
                        ),
                    }
                ]}
            />
            <Flex
                justify="end"
                style={{ marginBottom: 16 }}
            >

                <Button type="primary" onClick={()=>setOpen(true)}>
                    Create New Customer
                </Button>
            </Flex>
            <Suspense fallback="Loading...">
                <Table
                    rowKey="id"
                    columns={columns}
                    dataSource={customer?.data}
                    loading={isPending}
                    pagination={{
                        position: ['bottomRight'],
                        showSizeChanger: true,
                        onChange: (page, limit) => {
                            setPage(page);
                            setLimit(limit);
                        },
                        total: customer?.meta.total_items,
                        current: page,
                        locale: {
                            items_per_page: '/ trang',
                        },
                        pageSize: limit,
                        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`
                    }}
                />
            </Suspense>
            <CustomerModal
                open={open}
                setOpen={setOpen}
            />
        </>
    );
};

export default Customer;