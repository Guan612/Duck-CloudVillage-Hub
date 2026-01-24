import { DataTable } from "@/components/component/dataTable";
import { Button } from "@/components/ui/button";
import { requireAuth } from "@/hooks/auth/useAuthGurad";
import useMyCart from "@/hooks/cart/useMyCart";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_sub/cart/")({
  beforeLoad: ({ location }) => requireAuth(location.href),
  component: RouteComponent,
  staticData: {
    title: "购物车",
  },
});

function RouteComponent() {
  const { cartList, columns } = useMyCart();
  console.log(cartList);
  return (
    <div className="flex h-full flex-col items-center justify-center">
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <DataTable data={cartList} columns={columns} />
      </div>

      {/*底栏*/}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/80 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60">
        <div className="container flex items-center gap-4 px-4 py-3 max-w-md mx-auto">
          <div className="flex items-center">
            <div className="font-bold">总计：</div>
            <div className="font-bold text-red-500 text-xl">{20}</div>
          </div>
          <div className="flex flex-1 items-center gap-3">
            <Button>去结算</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
