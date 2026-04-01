import SimpleListPage from "../../../components/common/SimpleListPage";
import { productsService } from "../../../services/products.service";
import { useAuthStore } from "../../../store/auth.store";

export default function CatalogsPage() {
  const { user } = useAuthStore();
  return (
    <SimpleListPage
      title="الكتالوجات"
      queryKey="catalogs"
      fetchFn={productsService.getCatalogs}
      createFn={productsService.createCatalog}
      updateFn={productsService.updateCatalog}
      deleteFn={productsService.deleteCatalog}
      tenant_id={user?.tenant_id ?? ""}
      itemLabel="كتالوج"
    />
  );
}
