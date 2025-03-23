import { getUserAddresses } from "@/app/actions/adresses";
import { getUserById } from "@/app/actions/users";
import { AddressList } from "@/components/users/address-list";
import { notFound } from "next/navigation";

interface AddressesPageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    page?: string;
  }>;
}

export default async function AddressesPage({
  params,
  searchParams,
}: AddressesPageProps) {
  const { id } = await params;
  const { page: pageParam } = await searchParams;
  const userId = parseInt(id);
  const page = parseInt(pageParam || "1");

  const user = await getUserById(userId);
  if (!user) {
    notFound();
  }

  const {
    items: addresses,
    totalPages,
    currentPage,
  } = await getUserAddresses(userId, { page, pageSize: 10 });

  return (
    <div className="container mx-auto mt-8">
      <AddressList
        initialAddresses={addresses}
        totalPages={totalPages}
        currentPage={currentPage}
        user={user}
      />
    </div>
  );
}
