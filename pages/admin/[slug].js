import styles from '@/styles/Admin.module.css';
import AuthCheck from '@/components/AuthCheck';
import { firestore, auth, serverTimestamp } from '@/lib/firebase';
import ImageUploader from '@/components/ImageUploader';
import VideoUploader from '@/components/VideoUploader';

import { useState } from 'react';
import { useRouter } from 'next/router';

import { useDocumentData } from 'react-firebase-hooks/firestore';
import { useForm } from 'react-hook-form'; // keep track of form inputs, and if form is valid,invalid
import ReactMarkdown from 'react-markdown'; // markdown notation for post
import Link from 'next/link';
import toast from 'react-hot-toast';
import ReactPlayer from 'react-player';

export default function AdminPostEdit(props) {
  return (
    <AuthCheck>
        <PostManager />
    </AuthCheck>
  );
}

function PostManager() {
    const [preview, setPreview] = useState(false);

    const router = useRouter();
    const { slug } = router.query;

    // since the user was autheticated, we can just grab it
    const postRef = firestore.collection('users').doc(auth.currentUser.uid).collection('posts').doc(slug);
    const [post] = useDocumentData(postRef); // real time - listen to the host
    //const [post] = useDocumentDataOnce(postRef); // only need read once to post the form

    return (
    <main className={styles.container}>
        {post && (
        <>
            <section>
            <h1>{post.title}</h1>
            <p>ID: {post.slug}</p>

            <PostForm postRef={postRef} defaultValues={post} preview={preview} />
            </section>

            <aside>
            <h3>Tools</h3>
            <button onClick={() => setPreview(!preview)}>{preview ? 'Edit' : 'Preview'}</button>
            <Link href={`/${post.username}/${post.slug}`}>
                <button className="btn-blue">Live view</button>
            </Link>
            </aside>
        </>
        )}
    </main>
    );
}

function PostForm({ defaultValues, postRef, preview }) {
    const { register, handleSubmit, reset, watch, formState, errors } = useForm({ defaultValues, mode: 'onChange' });

    const { isValid, isDirty } = formState; // is dirty means the user interacted with it

    const updatePost = async ({ content, published, video_url }) => {
    await postRef.update({
        content,
        published,
        video_url,
        updatedAt: serverTimestamp(),
    });

    reset({ content, published, video_url });

    toast.success('Post updated successfully!')
    };

    // watch() the content and render in markdown

    return (
    <form onSubmit={handleSubmit(updatePost)}>
        {preview && (
        <div className="card">
            <ReactMarkdown>{watch('content')}</ReactMarkdown> 
        </div>
        ) && (
            <div className="card">
                <ReactPlayer id="postVid"
                                        url={watch('video_url')}
                                        width='100%'
                                        height='100%'
                                        playing={true}
                                        controls={true}
                                        volume={1}
                                        progressInterval={5000}
                                        pip={true}
                                    />
        </div>
        ) }

        <div className={preview ? styles.hidden : styles.controls}>

            <ImageUploader />
            <VideoUploader />


            <textarea name="content" ref={register({
                maxLength: { value: 20000, message: 'content is too long' },
                minLength: { value: 10, message: 'content is too short' },
                required: { value: true, message: 'content is required'}
            })}></textarea>

            {errors.content && <p className="text-danger">{errors.content.message}</p>}

        <fieldset>
            <input className={styles.checkbox} name="published" type="checkbox" ref={register} />
            <label>Published</label>
        </fieldset>

        <button type="submit" className="btn-green" disabled={!isDirty || !isValid}>
            Save Changes
        </button>
        </div>
    </form>
    );
}