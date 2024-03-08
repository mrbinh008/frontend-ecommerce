import { Suspense, useEffect, useRef, useState } from 'react';
import { SearchOutlined, CheckOutlined, CloseOutlined, HomeOutlined, UserOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { GetRef, TableColumnsType, TableColumnType } from 'antd';
import { Breadcrumb, Button, Flex, Input, Popconfirm, Space, Switch, Table, message } from 'antd';
import type { FilterDropdownProps } from 'antd/es/table/interface';
import Highlighter from 'react-highlight-words';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { changeBrandFeatured, changeBrandStatus, deleteBrand, fetchAllBrand } from '@services/admin/brand.service';
import { IBrand } from '@interface/admin.brand';
import BrandModal from '@/components/admin/brand/brand.modal';

type InputRef = GetRef<typeof Input>;

type DataIndex = keyof IBrand;

const Brand = () => {
    const [searchText, setSearchText] = useState('');
    const [searchedColumn, setSearchedColumn] = useState('');
    const [page, setPage] = useState<number>(1);
    const [limit, setLimit] = useState<number>(10);
    const [open, setOpen] = useState<boolean>(false);
    const [isEdit, setIsEdit] = useState<boolean>(false);
    const [brandEdit, setBrandEdit] = useState<IBrand>();
    const searchInput = useRef<InputRef>(null);
    const [messageApi, contextHolder] = message.useMessage();
    const queryClient = useQueryClient();
    
    const { isPending, error, data: brand } = useQuery({
        queryKey: ['fetchAllBrand', page],
        queryFn: async () => await fetchAllBrand(page, limit),
        placeholderData: keepPreviousData,
    })
    const changeStatus = useMutation({
        mutationFn: async (id: number) => await changeBrandStatus(id),
        onSuccess: () => {
            messageApi.success('Cập nhật trạng thái thành công');
            queryClient.invalidateQueries({ queryKey: ["fetchAllBrand"] });
        },
        onError: () => {
            messageApi.error('An error has occurred');
        },
    })
    const changeFeatured = useMutation({
        mutationFn: async (id: number) => await changeBrandFeatured(id),
        onSuccess: () => {
            messageApi.success('Cập nhật trạng thái nổi bật thành công');
            queryClient.invalidateQueries({ queryKey: ["fetchAllBrand"] });
        },
        onError: () => {
            messageApi.error('An error has occurred');
        },
    })
    const destroyBrand = useMutation({
        mutationFn: async (id: number) => await deleteBrand(id),
        onSuccess: () => {
            messageApi.success('Xoá thành công');
            queryClient.invalidateQueries({ queryKey: ["fetchAllBrand"] });
        },
        onError: () => {
            messageApi.error('An error has occurred');
        },
    })


    useEffect(() => {
        if (error) {
            messageApi.error('An error has occurred: ' + error.message );
        }
    }, [error, messageApi])

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

    const getColumnSearchProps = (dataIndex: DataIndex): TableColumnType<IBrand> => ({
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


    const columns: TableColumnsType<IBrand> = [
        {
            title: 'Tên',
            dataIndex: 'name',
            key: 'name',
            width: '30%',
            ...getColumnSearchProps('name'),
        },
        {
            title: 'Logo',
            dataIndex: 'logo',
            key: 'logo',
            render: (logo: string) => <img src={logo} alt="logo" style={{ width: '50px' }} />
        },
        {
            title: 'Mô tả',
            dataIndex: 'description',
            key: 'description',
            ...getColumnSearchProps('description'),
            sorter: (a, b) => a.description.length - b.description.length,
            sortDirections: ['descend', 'ascend'],
            render: (_, record: IBrand) => (
                <Space>
                    <span>{record.description}</span>
                </Space>
            ),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'is_active',
            key: 'is_active',
            render: (_, record: IBrand) => (
                <Switch
                    checkedChildren={<CheckOutlined />}
                    unCheckedChildren={<CloseOutlined />}
                    checked={record?.is_active}
                    loading={changeStatus.isPending}
                    onChange={() => changeStatus.mutate(record?.id as number)}
                />
            ),
        },
        {
            title: 'Nổi bật',
            dataIndex: 'featured',
            key: 'featured',
            render: (_, record: IBrand) =>
                <Switch
                    checkedChildren={<CheckOutlined />}
                    unCheckedChildren={<CloseOutlined />}
                    checked={record?.featured}
                    loading={changeFeatured.isPending}
                    onChange={() => changeFeatured.mutate(record?.id as number)}
                />,
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record: IBrand) => (
                <>
                    <Space size="middle">
                        <EditOutlined style={{ fontSize: 20, color: "orange" }} onClick={() => handleEdit(record)} />
                        {/* <DeleteOutlined style={{ fontSize: 20 }} onClick={() => handleDelete(record)} /> */}
                        <Popconfirm
                            title="Xoá thương hiệu?"
                            description={`Bạn chắc chắn muốn xoá ${record?.name}?`}
                            okText="Xoá"
                            cancelText="Huỷ"
                            onConfirm={() => handleDelete(record?.id as number)}
                        >
                            <DeleteOutlined style={{ fontSize: 20, color: "red" }} />
                        </Popconfirm>
                    </Space>
                </>
            ),
        }
    ];

    const handleEdit = (record: IBrand) => {
        setOpen(true)
        setIsEdit(true)
        setBrandEdit(record)
    }
    const handleDelete = (id: number) => {
        destroyBrand.mutate(id);
    }
    return (
        <>
            {contextHolder}
            <Breadcrumb
                style={{ margin: '16px 0' }}
                items={[
                    {
                        title: <Link to="/admin"><HomeOutlined /> Trang chủ</Link>,
                    },
                    {
                        title: (
                            <>
                                <UserOutlined />
                                <span>Danh sách thương hiệu</span>
                            </>
                        ),
                    }
                ]}
            />
            <Flex
                justify="end"
                style={{ marginBottom: 16 }}
            >

                <Button type="primary" onClick={() => setOpen(true)}>
                    Tạo mới thương hiệu
                </Button>
            </Flex>
            <Suspense fallback="Loading...">
                <Table
                    rowKey="id"
                    columns={columns}
                    dataSource={brand?.data}
                    loading={isPending}
                    pagination={{
                        position: ['bottomRight'],
                        showSizeChanger: true,
                        onChange: (page, limit) => {
                            setPage(page);
                            setLimit(limit);
                        },
                        total: brand?.meta.total_items,
                        current: page,
                        locale: {
                            items_per_page: '/ trang',
                        },
                        pageSize: limit,
                        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`
                    }}
                />
            </Suspense>
            <BrandModal
                open={open}
                setOpen={setOpen}
                brandEdit={brandEdit}
                setBrandEdit={setBrandEdit}
                isEdit={isEdit}
                setIsEdit={setIsEdit}
            />
        </>
    );
};

export default Brand;