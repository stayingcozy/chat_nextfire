import { useState } from 'react';
import { auth, storage, STATE_CHANGED } from '@/lib/firebase';
import Loader from './Loader';
import VideoPlayer from './VideoPlayer';

// Uploads images to Firebase Storage
export default function VideoUploader() {
  const [uploading, setUploading] = useState(false); // true if file is being uploaded to the cloud
  const [progress, setProgress] = useState(0); // progress of the upload %
  const [downloadURL, setDownloadURL] = useState(null); // download link avail when complete

  // Creates a Firebase Upload Task
  const uploadFile = async (e) => {
    // Get the file
    const file = Array.from(e.target.files)[0];
    const extension = file.type.split('/')[1];

    // Makes reference to the storage bucket location
    const ref = storage.ref(`uploads/${auth.currentUser.uid}/${Date.now()}.${extension}`);
    setUploading(true);

    // Starts the upload
    const task = ref.put(file);

    // Listen to updates to upload task
    task.on(STATE_CHANGED, (snapshot) => {
      const pct = ((snapshot.bytesTransferred / snapshot.totalBytes) * 100).toFixed(0);
      setProgress(pct);

      // Get downloadURL AFTER task resolves - by using then (Note: this is not a native Promise) 
      task
        .then((d) => ref.getDownloadURL())
        .then((url) => {
          setDownloadURL(url);
          setUploading(false);
        });
    });
  };

  return (
    <div className="box">
        <Loader show={uploading} />
        {uploading && <h3>{progress}%</h3>}

        {!uploading && (
        <>
            <label className="btn">
            📹 Upload Video
            <input type="file" onChange={uploadFile} accept="video/mp4" />
            </label>
        </>
    )}
    {downloadURL && <code className="upload-snippet">{`${downloadURL}`}</code>}
    {downloadURL && <button Video onClick={VideoPlayer(downloadURL)}>Watch</button>}

    </div>
  );
}