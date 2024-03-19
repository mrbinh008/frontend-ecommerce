import ProductForm from "@components/admin/product/product.form";
import { Breadcrumb, Space } from "antd";
import { HomeOutlined, ProductOutlined } from '@ant-design/icons';

const ProductCreatePage = () => {
    document.title = "Thêm mới sản phẩm";
    return (
        <>
            <Space direction="vertical" style={{width:"100%"}} size="large">
                <Breadcrumb 
                    separator=">"
                    style={{fontSize: "16px",margin:"1em 0"}}
                    items={[
                        {
                            href: '',
                            title: <HomeOutlined />,
                        },
                        {
                            href: '',
                            title: (
                                <>
                                    <ProductOutlined />
                                    <span>Sản phẩm</span>
                                </>
                            ),
                        },
                        {
                            title: 'Thêm mới sản phẩm',
                        },
                    ]}
                />
                <ProductForm />
            </Space>
        </>
    );
};

export default ProductCreatePage;