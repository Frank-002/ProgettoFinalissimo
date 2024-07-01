import { Alert, Button, Form, ProgressBar, Container } from 'react-bootstrap';
import React, { useEffect, useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from "firebase/storage";
import { app } from '../firebase.js';
import { useNavigate, useParams } from 'react-router-dom';
import { useUser } from '../components/UserContext.jsx';

const UpdatePost = () => {
  const { currentUser } = useUser();
  const navigate = useNavigate();
  const { postId } = useParams();

  const [file, setFile] = useState(null);
  const [imageUploadProgress, setImageUploadProgress] = useState(null);
  const [imageUploadError, setImageUploadError] = useState(null);
  const [formData, setFormData] = useState({});
  const [publishError, setPublishError] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await fetch(`/api/post/getposts?postId=${postId}`);
        const data = await res.json();

        if (!res.ok) {
          console.log(data.message);
          setPublishError(data.message);
          return;
        }

        if (res.ok) {
          setPublishError(null);
          setFormData(data.posts[0]);
        }
      } catch (error) {
        console.log(error.message);
      }
    };

    fetchPost();
  }, [postId]);

  const handleImageUpload = async () => {
    try {
      if (!file) {
        setImageUploadError('Seleziona una immagine da caricare');
        return;
      }

      setImageUploadError(null);

      const storage = getStorage(app);
      const fileName = new Date().getTime() + '-' + file.name;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on('state_changed', (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setImageUploadProgress(progress.toFixed(0));
      }, (error) => {
        setImageUploadError('Image upload failed');
        setImageUploadProgress(null);
      }, () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setImageUploadProgress(null);
          setImageUploadError(null);
          setFormData({ ...formData, image: downloadURL });
        });
      });

    } catch (error) {
      setImageUploadError('Image upload failed');
      setImageUploadProgress(null);
      console.log(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/post/updatepost/${formData._id}/${currentUser._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setPublishError(data.message);
        return;
      }

      if (res.ok) {
        setPublishError(null);
        navigate(`/post/${data.slug}`);
      }

    } catch (error) {
      setPublishError('Something went wrong');
    }
  };

  return (
      <div>
        <div className="jumbotron jumbotron-fluid text-white bg-dark">
          <Container className="text-center">
            <h1 className="display-3">Aggiorna un post</h1>
          </Container>
        </div>

        <Container className="my-5">
          <div className="row justify-content-center">
            <div className="col-lg-6 col-md-8">
              {currentUser ? (
                  <Form onSubmit={handleSubmit} className="bg-light p-4 rounded shadow-sm">
                    <Form.Group controlId="title" className="mb-4">
                      <Form.Label>Titolo</Form.Label>
                      <Form.Control
                          type="text"
                          placeholder="Titolo"
                          required
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          value={formData.title}
                      />
                    </Form.Group>

                    <Form.Group controlId="category" className="mb-4">
                      <Form.Label>Categorie</Form.Label>
                      <Form.Control as="select" onChange={(e) => setFormData({ ...formData, category: e.target.value })} value={formData.category}>
                        <option value="uncategorized">Seleziona categoria</option>
                        <option value="sport">Sport</option>
                        <option value="animali">Animali</option>
                        <option value="scienza">Scienza</option>
                        <option value="arte">Arte</option>
                        <option value="notizie">Notizie</option>
                      </Form.Control>
                    </Form.Group>

                    <Form.Group controlId="file" className="mb-4">
                      <Form.Label>Upload Immagine</Form.Label>
                      <Form.Control type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} />
                      <Button variant="primary" onClick={handleImageUpload} className="mt-2 w-100">
                        {imageUploadProgress ? (
                            <ProgressBar now={imageUploadProgress} label={`${imageUploadProgress}%`} />
                        ) : (
                            'Upload Immagine'
                        )}
                      </Button>
                    </Form.Group>

                    {imageUploadError && <Alert variant="danger">{imageUploadError}</Alert>}

                    {formData.image && <img src={formData.image} alt="upload" className="img-fluid mb-3" />}

                    <Form.Group controlId="content" className="mb-4">
                      <Form.Label>Contenuto</Form.Label>
                      <ReactQuill
                          theme="snow"
                          className="mb-3"
                          required
                          onChange={(value) => setFormData({ ...formData, content: value })}
                          value={formData.content}
                          style={{ height: '300px' }}
                      />
                    </Form.Group>
                    <Button type="submit" variant="primary" className="w-100 mt-4">
                      Aggiorna
                    </Button>

                    {publishError && <Alert className="mt-3" variant="danger">{publishError}</Alert>}
                  </Form>
              ) : (
                  <Alert variant="danger">Non sei autorizzato a creare un post.</Alert>
              )}
            </div>
          </div>
        </Container>
      </div>
  );
};

export default UpdatePost;

