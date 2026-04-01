import SimpleListPage from "../../../components/common/SimpleListPage";
import { productsService } from "../../../services/products.service";
import { useAuthStore } from "../../../store/auth.store";

export default function SectionsPage() {
  const { user } = useAuthStore();
  return (
    <SimpleListPage
      title="الأقسام"
      queryKey="sections"
      fetchFn={productsService.getSections}
      createFn={productsService.createSection}
      updateFn={productsService.updateSection}
      deleteFn={productsService.deleteSection}
      tenant_id={user?.tenant_id ?? ""}
      itemLabel="قسم"
    />
  );
}
