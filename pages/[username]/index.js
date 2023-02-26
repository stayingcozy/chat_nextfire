import UserProfile from '../../components/UserProfile';
import PostFeed from '../../components/PostFeed';
import { getUserWithUsername, postToJSON } from '../../lib/firebase';

// render server side
export async function getServerSideProps({ query }) {
    const { username } = query;

    const userDoc = await getUserWithUsername(username);

    // If no user, short circuit to 404 page
    if (!userDoc) {
        return {
        notFound: true,
        };
    }

    // JSON serializable data
    let user = null;
    let posts = null;

    // get post that user has authored
    if (userDoc) {
        user = userDoc.data();
        const postsQuery = userDoc.ref
            .collection('posts')
            .where('published','==',true)
            .orderBy('createdAt','desc')
            .limit(5);
        // execute post
        posts = (await postsQuery.get()).docs.map(postToJSON);
    }

    return {
        props: {user, posts}, //  will be passed to the page component as props
    };
}


export default function UserProfilePage({ user, posts }) {
    return(
        <main>
            <UserProfile user={user} />
            <PostFeed posts={posts} />
        </main>
    )
}