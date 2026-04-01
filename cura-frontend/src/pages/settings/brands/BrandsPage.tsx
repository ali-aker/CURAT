import SimpleListPage from "../../../components/common/SimpleListPage";
import { productsService } from "../../../services/products.service";
import { useAuthStore } from "../../../store/auth.store";

export default function BrandsPage() {
  const { user } = useAuthStore();
  return (
    <SimpleListPage
      title="الماركات"
      queryKey="brands"
      fetchFn={productsService.getBrands}
      createFn={productsService.createBrand}
      updateFn={productsService.updateBrand}
      deleteFn={productsService.deleteBrand}
      tenant_id={user?.tenant_id ?? ""}
      itemLabel="ماركة"
    />
  );
}
