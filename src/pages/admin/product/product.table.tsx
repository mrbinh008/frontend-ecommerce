import { Suspense, useEffect, useRef, useState } from 'react';
import { SearchOutlined, CheckOutlined, CloseOutlined, HomeOutlined, UserOutlined,EditOutlined,DeleteOutlined} from '@ant-design/icons';
import type { GetRef, TableColumnsType, TableColumnType } from 'antd';
import { App, Breadcrumb, Button, Flex, Input, Popconfirm, Space, Switch, Table, message } from 'antd';
import type { FilterDropdownProps } from 'antd/es/table/interface';
import Highlighter from 'react-highlight-words';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, Navigate } from 'react-router-dom';
import { IProduct } from '@interface/admin.product';
import { changeFeaturedProduct, changeStatusProduct, deleteProduct, fetchAllProduct } from '@services/admin/product.service';

type InputRef = GetRef<typeof Input>;

type DataIndex = keyof IProduct;

const Product = () => {
    const [searchText, setSearchText] = useState('');
    const [searchedColumn, setSearchedColumn] = useState('');
    const [page, setPage] = useState<number>(1);
    const [limit, setLimit] = useState<number>(10);
    const searchInput = useRef<InputRef>(null);
    const queryClient = useQueryClient();
    const {message} = App.useApp();

    const { isPending, error, data: products } = useQuery({
        queryKey: ['fetchProduct', page,limit],
        queryFn: async () => await fetchAllProduct(page, limit),
        placeholderData: keepPreviousData,
    })

    const changeStatus = useMutation({
        mutationFn: async (id: number) => await changeStatusProduct(id),
        onSuccess: () => {
            message.success('Cập nhật trạng thái thành công');
            queryClient.invalidateQueries({ queryKey: ["fetchProduct"] });
        },
        onError: () => {
            message.error('An error has occurred');
        },
    })
    const changeFeatured = useMutation({
        mutationFn: async (id: number) => await changeFeaturedProduct(id),
        onSuccess: () => {
            message.success('Cập nhật trạng thái nổi bật thành công');
            queryClient.invalidateQueries({ queryKey: ["fetchProduct"] });
        },
        onError: () => {
            message.error('An error has occurred');
        },
    })
    const handleDelete = useMutation({
        mutationFn: async (id: number) => await deleteProduct(id),
        onSuccess: () => {
            message.success('Xoá thành công');
            queryClient.invalidateQueries({ queryKey: ["fetchProduct"] });
        },
        onError: () => {
            message.error('An error has occurred');
        },
    })
    useEffect(() => {
        if (error) {
            message.error('An error has occurred: ' + error.message);
        }
    }, [error, message]);

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

    const getColumnSearchProps = (dataIndex: DataIndex): TableColumnType<IProduct> => ({
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

    const columns: TableColumnsType<IProduct> = [
        {
            title: 'Tên',
            dataIndex: 'product_name',
            key: 'product_name',
            ...getColumnSearchProps('product_name'),
        },
        {
            title: 'Sku',
            dataIndex: 'sku',
            key: 'sku',
            ...getColumnSearchProps('sku'),
        },
        {
            title: 'Thương hiệu',
            dataIndex: 'brand_name',
            key: 'brand_name',
            ...getColumnSearchProps('brand_name'),
        },
        {
            title: 'Mô tả',
            dataIndex: 'description',
            key: 'description',
            ...getColumnSearchProps('description'),
           render: (description: string) => description.length > 50 ? `${description.slice(0, 50)}...` : description
        },
        {
            title: 'Số lượng',
            dataIndex: 'total_quantity',
            key: 'total_quantity',
            ...getColumnSearchProps('total_quantity'),
        },
        {
            title: 'Giá (VNĐ)',
            dataIndex: 'price',
            key: 'price',
            ...getColumnSearchProps('price'),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'is_published',
            render: (_, record: IProduct) =>

                <Switch
                    checkedChildren={<CheckOutlined />}
                    unCheckedChildren={<CloseOutlined />}
                    checked={record.is_published}
                    loading={changeStatus.isPending}
                    onChange={() => changeStatus.mutate(record.id)}
                />
        },
        {
            title: 'Nổi bật',
            dataIndex: 'is_featured',
            render: (_, record: IProduct) =>

                <Switch
                    checkedChildren={<CheckOutlined />}
                    unCheckedChildren={<CloseOutlined />}
                    checked={record.is_featured}
                    loading={changeFeatured.isPending}
                    onChange={() => changeFeatured.mutate(record.id)}
                />
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record: IProduct) => (
                <>
                    <Space size="middle">
                        <Link to={`/admin/product/${record?.id}/edit`}><EditOutlined style={{ fontSize: 20, color: "orange" }} /></Link>
                        <Popconfirm
                            title="Xoá thương hiệu?"
                            description={`Bạn chắc chắn muốn xoá ${record?.product_name}?`}
                            okText="Xoá"
                            cancelText="Huỷ"
                            onConfirm={() => handleDelete.mutate(record?.id as number)}
                        >
                            <DeleteOutlined style={{ fontSize: 20, color: "red" }} />
                        </Popconfirm>
                    </Space>
                </>
            ),
        }
    ];


    return (
        <>
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
                                <span>Danh sách sản phẩm</span>
                            </>
                        ),
                    }
                ]}
            />
            <Suspense fallback="Loading...">
                <Table
                    rowKey="id"
                    columns={columns}
                    dataSource={products?.data}
                    loading={isPending}
                    pagination={{
                        position: ['bottomRight'],
                        showSizeChanger: true,
                        onChange: (page, limit) => {
                            setPage(page);
                            setLimit(limit);
                        },
                        total: products?.meta.total_items as number,
                        current: page,
                        locale: {
                            items_per_page: '/ trang',
                        },
                        pageSize: limit,
                        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`
                    }}
                />
            </Suspense>
        </>
    );
};

export default Product;