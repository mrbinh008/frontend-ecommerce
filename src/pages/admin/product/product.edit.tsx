import ProductForm from "@components/admin/product/product.form";
import { Breadcrumb, Space } from "antd";
import { HomeOutlined, ProductOutlined } from '@ant-design/icons';
import { Suspense } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchProductById } from "@/services/admin/product.service";

const ProductEditPage = () => {

    const { id } = useParams<{ id: string }>();
        const { data: product } = useQuery({
            queryKey: ['fetchBrand',id],
            queryFn: async () => await fetchProductById(id as unknown as number),
            refetchOnWindowFocus: false,
            staleTime: 1000 * 60 * 5,
        })
    return (
        <>
            <Space direction="vertical" style={{ width: "100%" }} size="large">
                <Breadcrumb
                    separator=">"
                    style={{ fontSize: "16px", margin: "1em 0" }}
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
                            title: 'Cập nhật sản phẩm',
                        },
                    ]}
                />
                <Suspense fallback={<div>Loading...</div>}>
                    <ProductForm
                        product={product?.data}
                    />
                </Suspense>
            </Space>
        </>
    );
};

export default ProductEditPage;