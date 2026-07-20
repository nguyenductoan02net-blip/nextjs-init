import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';

import { getDiscussionsQueryOptions } from '@/features/discussions/api/get-discussions';

import { Discussions } from './_components/discussions';

export const metadata = {
  title: 'Discussions',
  description: 'Discussions',
};

const DiscussionsPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) => {
  const params = await searchParams;
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery(
    getDiscussionsQueryOptions({
      page: params.page ? Number(params.page) : 1,
    }),
  );

  const dehydratedState = dehydrate(queryClient);

  return (
    <HydrationBoundary state={dehydratedState}>
      <Discussions />
    </HydrationBoundary>
  );
};

export default DiscussionsPage;
