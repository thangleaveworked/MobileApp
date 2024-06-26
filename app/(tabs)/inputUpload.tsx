'use client'
import React from 'react';
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from '../../firebaseConfig';

export function InputUpload({ onChange, imgLink }) {
    const handleImageDelete = () => {
        if (imgLink === null) return;
        const parts = imgLink.split('/images%2F');
        const imgName = parts[1].split('?');
        const imgRef = ref(storage, `images/${imgName[0]}`);
        deleteObject(imgRef)
            .then(() => {
                onChange(null);
                let up = document.querySelector('#upload');
                up.value = ''
            })
            .catch((error) => {
                console.error("Lỗi khi xóa hình ảnh:", error);
            });
    }

    const handleImageUpload = (e) => {
        if(e.target.files[0] === null) return;
        const imgRef = ref(storage, `images/${e.target.files[0].name}`)
        uploadBytes(imgRef, e.target.files[0]).then(async () => {
            const downloadURL = await getDownloadURL(imgRef);
            onChange(downloadURL);
        });
    }

    return (
        <div>
            {imgLink ? (
                <div>
                    <img src={imgLink} alt="uploaded" style={{ width: '100%', height: 'auto' }} />
                    <button onClick={handleImageDelete}>Xóa Hình Ảnh</button>
                </div>
            ) : (
                <input type="file" id="upload" onChange={handleImageUpload} />
            )}
        </div>
    );
}
