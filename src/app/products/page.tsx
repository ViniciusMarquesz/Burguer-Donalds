import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";

const Products = () => {
    return (
        <div className="min-h-screen bg-gray-100">
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
                    <h1 className="text-3xl font-bold text-gray-900">Products</h1>
                </div>
            </header>
            <main>
                <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
                    <p className="text-blue-700">Welcome to the products page!</p>
                </div>
                    <Button>Add Product</Button>
                    <Input placeholder="Search Products" />
            </main>
        </div>
    );
}
 
export default Products;