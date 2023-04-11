import { SignIn, SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";

import { RouterOutputs, api } from "~/utils/api";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Image from "next/image";
import { LoadingPage } from "~/components/Loading";
import { TRPCError } from "@trpc/server";

dayjs.extend(relativeTime);

const CreatePostWizard = () => {
  const { user } = useUser();

  console.log(user);
  if (!user) return null;

  return (
    <div className="flex w-full gap-3 text-amber-100">
      <Image
        src={user.profileImageUrl}
        alt={`${user.username}'s profile image`}
        height={56}
        width={56}
        className="h-16 w-16 rounded-full"
      />
      <input
        placeholder="type some emojis"
        className="grow bg-transparent outline-none"
      />
    </div>
  );
};

type PostWithUser = RouterOutputs["posts"]["getAll"][number];
const PostView = (props: PostWithUser) => {
  const { post, author } = props;
  return (
    <div key={post.id} className="flex gap-3 border-b border-rose-300 p-4">
      <Image
        src={author.profilePicture}
        height={56}
        width={56}
        alt={`${author.username}'s profile picture`}
        className="h-16 w-16 rounded-full"
      />
      <div className="flex flex-col">
        <div className="flex text-amber-100">
          <span>
            {`@${author.username}`}{" "}
            <span className="font-thin">{`· ${dayjs(
              post.createdAt
            ).fromNow()}`}</span>
          </span>
        </div>
        <span>{post.content}</span>
      </div>
    </div>
  );
};
const Feed = () => {
  const { data, isLoading: postsLoading } = api.posts.getAll.useQuery();

  if (postsLoading) return <LoadingPage />;

  if (!data)
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Something went wrong...",
    });
  return (
    <div className="flex flex-col">
      {[...data, ...data].map((fullPost) => (
        <PostView {...fullPost} key={fullPost.post.id} />
      ))}
    </div>
  );
};

const Home: NextPage = () => {
  const { isLoaded: userLoaded, isSignedIn } = useUser();
  useUser();

  // Fetch data ASAP (with React Query, you only have to fetch data once, and as long as the thing you're fetching with is the same, it will use the cached data.
  api.posts.getAll.useQuery();

  // Return empty div if BOTH aren't loaded in case user loads faster
  if (!userLoaded) return <div />;

  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex h-screen justify-center">
        <div className="h-full w-full border-x border-rose-300 md:max-w-2xl">
          <div className="flex border-b border-rose-300 p-4">
            {!isSignedIn && (
              <div className="flex justify-center">
                <SignInButton />
              </div>
            )}
            {isSignedIn && (
              <div className="flex grow justify-center">
                <CreatePostWizard />
              </div>
            )}
          </div>
          <Feed />
        </div>
      </main>
    </>
  );
};

export default Home;
