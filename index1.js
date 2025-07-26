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
        status: 'pending', // Always set to pending for admin approval
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        email: currentUser.email // Store user email for admin notifications
    };

    // Add a new blog to Firestore
    db.collection('blogs').add(newBlog)
        .then((docRef) => {
            // Send notification to admin
            sendAdminNotification(newBlog, docRef.id);
            
            blogForm.reset();
            blogFormContainer.classList.remove('show');
            writeBlogBtn.innerHTML = '<i class="fas fa-pen-nib"></i> Write a Blog';
            
            showToast('Your blog has been submitted for admin approval!', 'warning');
            document.getElementById('blogs').scrollIntoView({ behavior: 'smooth' });
        })
        .catch((error) => {
            console.error("Error adding blog: ", error);
            showToast('Error submitting blog: ' + error.message, 'error');
        });
});

// Function to send notification to admin
function sendAdminNotification(blog, blogId) {
    // Create a notification in the admin notifications collection
    db.collection('adminNotifications').add({
        type: 'blog_approval',
        blogId: blogId,
        title: blog.title,
        author: blog.author,
        email: blog.email,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        status: 'unread',
        message: `New blog post "${blog.title}" by ${blog.author} (${blog.email}) requires approval.`
    })
    .then(() => {
        console.log("Admin notification sent successfully");
    })
    .catch((error) => {
        console.error("Error sending admin notification: ", error);
    });
    
    // You could also send an email notification here using a Cloud Function
    // For this, you would need to set up Firebase Cloud Functions
}

// Function to load admin notifications (for admin panel)
function loadAdminNotifications() {
    if (!isAdmin) return;
    
    const notificationsContainer = document.getElementById('adminNotifications');
    if (!notificationsContainer) return;
    
    notificationsContainer.innerHTML = '';
    
    db.collection('adminNotifications')
        .where('status', '==', 'unread')
        .orderBy('createdAt', 'desc')
        .limit(5)
        .get()
        .then((querySnapshot) => {
            if (querySnapshot.empty) {
                notificationsContainer.innerHTML = '<p>No new notifications</p>';
                return;
            }
            
            querySnapshot.forEach((doc) => {
                const notification = doc.data();
                const notificationElement = document.createElement('div');
                notificationElement.className = 'notification';
                notificationElement.innerHTML = `
                    <p>${notification.message}</p>
                    <small>${new Date(notification.createdAt?.toDate()).toLocaleString()}</small>
                    <button class="view-blog-btn" data-id="${notification.blogId}">View Blog</button>
                    <button class="mark-read-btn" data-id="${doc.id}">Mark as Read</button>
                `;
                notificationsContainer.appendChild(notificationElement);
            });
            
            // Add event listeners to the buttons
            document.querySelectorAll('.view-blog-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const blogId = this.getAttribute('data-id');
                    viewBlogForApproval(blogId);
                });
            });
            
            document.querySelectorAll('.mark-read-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const notificationId = this.getAttribute('data-id');
                    markNotificationAsRead(notificationId);
                });
            });
        })
        .catch((error) => {
            console.error("Error loading notifications: ", error);
        });
}

function viewBlogForApproval(blogId) {
    db.collection('blogs').doc(blogId).get()
        .then((doc) => {
            if (doc.exists) {
                openApprovalModal(doc.data());
            } else {
                showToast('Blog not found', 'error');
            }
        })
        .catch((error) => {
            showToast('Error loading blog: ' + error.message, 'error');
        });
}

function markNotificationAsRead(notificationId) {
    db.collection('adminNotifications').doc(notificationId).update({
        status: 'read'
    })
    .then(() => {
        loadAdminNotifications();
    })
    .catch((error) => {
        showToast('Error updating notification: ' + error.message, 'error');
    });
}

// Add this to your existing auth state listener
auth.onAuthStateChanged((user) => {
    if (user) {
        // User is signed in
        isLoggedIn = true;
        currentUser = user;

        // Check if user is admin
        isAdmin = adminEmails.includes(user.email);

        updateUIForLoginStatus();
        loadBlogs();

        if (isAdmin) {
            loadPendingBlogs();
            loadAdminNotifications(); // Add this line
            adminSection.style.display = 'block'; // Show admin panel
        } else {
            adminSection.style.display = 'none'; // Hide admin panel
        }
    } else {
        // User is signed out
        isLoggedIn = false;
        currentUser = null;
        isAdmin = false;
        updateUIForLoginStatus();
        loadBlogs();
        adminSection.style.display = 'none'; // Hide admin panel
    }
});

// Add these new functions to your existing JavaScript
function loadAdminNotifications() {
    const notificationsContainer = document.getElementById('adminNotifications');
    notificationsContainer.innerHTML = '<p class="no-notifications">Loading notifications...</p>';

    db.collection('adminNotifications')
        .where('status', '==', 'unread')
        .orderBy('createdAt', 'desc')
        .limit(10)
        .get()
        .then((querySnapshot) => {
            if (querySnapshot.empty) {
                notificationsContainer.innerHTML = '<p class="no-notifications">No new notifications</p>';
                return;
            }

            notificationsContainer.innerHTML = '';
            
            querySnapshot.forEach((doc) => {
                const notification = doc.data();
                const notificationElement = document.createElement('div');
                notificationElement.className = 'notification';
                notificationElement.innerHTML = `
                    <p>${notification.message}</p>
                    <small>${new Date(notification.createdAt?.toDate()).toLocaleString()}</small>
                    <div class="notification-actions">
                        <button class="view-blog-btn" data-id="${notification.blogId}">
                            <i class="fas fa-eye"></i> View Blog
                        </button>
                        <button class="mark-read-btn" data-id="${doc.id}">
                            <i class="fas fa-check"></i> Mark as Read
                        </button>
                    </div>
                `;
                notificationsContainer.appendChild(notificationElement);
            });

            // Add event listeners to buttons
            document.querySelectorAll('.view-blog-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const blogId = this.getAttribute('data-id');
                    viewBlogForApproval(blogId);
                });
            });

            document.querySelectorAll('.mark-read-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const notificationId = this.getAttribute('data-id');
                    markNotificationAsRead(notificationId);
                });
            });
        })
        .catch((error) => {
            notificationsContainer.innerHTML = `<p class="no-notifications">Error loading notifications: ${error.message}</p>`;
            console.error("Error loading notifications: ", error);
        });
}

function viewBlogForApproval(blogId) {
    db.collection('blogs').doc(blogId).get()
        .then((doc) => {
            if (doc.exists) {
                const blog = doc.data();
                blog.id = doc.id;
                openApprovalModal(blog);
            } else {
                showToast('Blog not found', 'error');
            }
        })
        .catch((error) => {
            showToast('Error loading blog: ' + error.message, 'error');
        });
}

function markNotificationAsRead(notificationId) {
    db.collection('adminNotifications').doc(notificationId).update({
        status: 'read',
        readAt: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => {
        showToast('Notification marked as read');
        loadAdminNotifications();
    })
    .catch((error) => {
        showToast('Error updating notification: ' + error.message, 'error');
    });
}

// Update your existing sendAdminNotification function
function sendAdminNotification(blog, blogId) {
    const notification = {
        type: 'blog_approval',
        blogId: blogId,
        title: blog.title,
        author: blog.author,
        email: blog.email,
        message: `New blog post "${blog.title}" by ${blog.author} (${blog.email}) requires approval.`,
        status: 'unread',
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    db.collection('adminNotifications').add(notification)
        .then(() => {
            console.log("Admin notification sent successfully");
            // Refresh notifications if admin is viewing the panel
            if (isAdmin) {
                loadAdminNotifications();
            }
        })
        .catch((error) => {
            console.error("Error sending admin notification: ", error);
        });
}
