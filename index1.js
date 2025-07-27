// Blog Form Submission
blogForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const title = document.getElementById('blogTitle').value;
    const image = document.getElementById('blogImage').value || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1470&q=80";
    const content = document.getElementById('blogContent').value;
    const date = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const newBlog = {
        title,
        author: currentUser.displayName || currentUser.email,
        image,
        content,
        date,
        userId: currentUser.uid,
        status: isAdmin ? 'approved' : 'pending', // Auto-approve if admin
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    // Add a new blog to Firestore
    db.collection('blogs').add(newBlog)
        .then((docRef) => {
            blogForm.reset();
            blogFormContainer.classList.remove('show');
            writeBlogBtn.innerHTML = '<i class="fas fa-pen-nib"></i> Write a Blog';

            if (isAdmin) {
                showToast('Your blog has been published successfully!');
                loadBlogs(); // Refresh the list
            } else {
                showToast('Your blog has been submitted for admin approval!', 'warning');
                
                // Create a notification for admin
                const notification = {
                    message: `New blog pending approval: "${title}" by ${newBlog.author}`,
                    type: 'blog_submission',
                    blogId: docRef.id,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    read: false
                };
                
                db.collection('notifications').add(notification)
                    .then(() => {
                        console.log("Notification created successfully");
                    })
                    .catch(error => {
                        console.error("Error creating notification: ", error);
                    });
            }

            document.getElementById('blogs').scrollIntoView({ behavior: 'smooth' });
        })
        .catch((error) => {
            console.error("Error adding blog: ", error);
            showToast('Error submitting blog: ' + error.message, 'error');
        });
});
