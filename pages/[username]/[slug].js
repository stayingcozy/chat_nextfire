import styles from '@/styles/Post.module.css';
import PostContent from '@components/PostContent';
import { firestore, fromMillis, getUserWithUsername, postToJSON } from '@/lib/firebase';
import { useDocumentData } from 'react-firebase-hooks/firestore';

export async function getStaticProps({ params }) {
    const {username, slug} = params;
    const userDoc = await getUserWithUsername(username);

    let post;
    let path;

    if (userDoc) {
        const postRef = userDoc.ref.collection('posts').doc(slug);
        post = postToJSON(await postRef.get());

        path = postRef.path;
    }

    return {
        props: { post, path },
        revalidate: 5000,
    }
}

export async function getStaticPaths() {
    // Improve my using Admin SDK to select empty docs
    const snapshot = await firestore.collectionGroup('posts').get();
  
    const paths = snapshot.docs.map((doc) => {
      const { slug, username } = doc.data();
      return {
        params: { username, slug },
      };
    });
  
    return {
      // must be in this format:
      // paths: [
      //   { params: { username, slug }}
      // ],
      paths,
      fallback: 'blocking',
    };
  }

export default function Post(props) {
    const postRef = firestore.doc(props.path);
    const [realtimePost] = useDocumentData(postRef);

    // if realtime is rendered use it, if not use past render -> HYDRATION 
    const post = realtimePost || props.post;

    // So it's now server rendered and SEO friendly but also reactive and real-time for end users

    return (
        <main className={styles.container}>

        <section>
            <PostContent post={post} />
        </section>

        <aside className="card">
            <p>
            <strong>{post.heartCount || 0} 🤍</strong>
            </p>

        </aside>
        </main>
    );
}