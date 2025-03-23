import { UserList } from "@/components/users/user-list";
import { getUsers } from "@/app/actions/users";

interface HomeProps {
  searchParams: Promise<{
    page?: string;
  }>;
}

export default async function Home({ searchParams }: HomeProps) {
  const { page: pageParam } = await searchParams;
  const page = parseInt(pageParam || "1");

  const {
    items: users,
    totalPages,
    currentPage,
  } = await getUsers({ page, pageSize: 10 });

  return (
    <div className="container mx-auto mt-8">
      <UserList
        initialUsers={users}
        totalPages={totalPages}
        currentPage={currentPage}
      />
    </div>
  );
}
