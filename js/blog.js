const blogList = [];

async function fetchBlogList() {
  try {
    const response = await fetch('http://localhost:5000/api/v1/blogs');
    if (response.ok) {
      const data = await response.json();
      blogList.push(...data.blogs);
      renderBlogList();
    } else {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error fetching blog list:', error);
  }
}

async function createBlogOnAPI(blog) {
  try {
    const response = await fetch('http://localhost:5000/api/v1/blogs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(blog),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const createdBlog = await response.json();
    return createdBlog;
  } catch (error) {
    console.error('Error creating blog:', error);
    throw error;
  }
}

let currentPage = 0;
const itemsPerPage = 4;

function createBlogListItem(blog) {
  const blogItem = document.createElement('li');
  blogItem.classList.add('blog-item');

  const img = document.createElement('img');
  img.src = blog.imageUrl;

  const blogDetails = document.createElement('div');
  blogDetails.classList.add('blog-details');

  const title = document.createElement('h2');
  const titleLink = document.createElement('a');
  titleLink.href = `blog-details.html?id=${blog.id}`;
  titleLink.textContent = blog.title;
  title.appendChild(titleLink);

  const dateAndReadTime = document.createElement('small');
  dateAndReadTime.textContent = `${blog.date} - ${blog.readTime} min read`;

  blogDetails.appendChild(title);
  blogDetails.appendChild(dateAndReadTime);

  blogItem.appendChild(img);
  blogItem.appendChild(blogDetails);

  return blogItem;
}

function renderBlogList() {
  const blogListElement = document.querySelector('.blog-list');
  blogListElement.innerHTML = '';

  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  for (let i = startIndex; i < endIndex && i < blogList.length; i++) {
    const blogItem = createBlogListItem(blogList[i]);
    blogListElement.appendChild(blogItem);
  }

  updatePaginationButtons();
}

function updatePaginationButtons() {
  const prevBtn = document.querySelector('.prev-btn');
  const nextBtn = document.querySelector('.next-btn');

  if (currentPage === 0) {
    prevBtn.disabled = true;
  } else {
    prevBtn.disabled = false;
  }

  if ((currentPage + 1) * itemsPerPage >= blogList.length) {
    nextBtn.disabled = true;
  } else {
    nextBtn.disabled = false;
  }
}

document.querySelector('.prev-btn').addEventListener('click', () => {
  currentPage--;
  renderBlogList();
});

document.querySelector('.next-btn').addEventListener('click', () => {
  currentPage++;
  renderBlogList();
});

renderBlogList();

function displayBlogDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const blogId = parseInt(urlParams.get('id'), 10);
  const blog = blogList.find((blog) => blog.id === blogId);

  if (blog) {
    document.querySelector('.blog-detail-image').src = blog.imageUrl;
    document.querySelector('.blog-detail-title').textContent = blog.title;
    document.querySelector('.blog-detail-date').textContent = blog.date;
    document.querySelector(
      '.blog-detail-readTime'
    ).textContent = `${blog.readTime} min read`;
    document
      .querySelector('.fb-comments')
      .setAttribute('data-href', window.location.href);
  }
}

function loadBlogForm() {
  const urlParams = new URLSearchParams(window.location.search);
  const blogId = parseInt(urlParams.get('id'), 10);

  if (blogId) {
    const blog = blogList.find((blog) => blog.id === blogId);
    if (blog) {
      document.getElementById('form-title').textContent = 'Edit Blog';
      document.getElementById('blog-id').value = blog.id;
      document.getElementById('blog-title').value = blog.title;
      document.getElementById('blog-date').value = blog.date;
      document.getElementById('blog-readTime').value = blog.readTime;
      document.getElementById('blog-imageUrl').value = blog.imageUrl;
    }
  }
}

async function saveBlog() {
  const idInput = document.getElementById('blog-id');
  const titleInput = document.getElementById('blog-title');
  const dateInput = document.getElementById('blog-date');
  const readTimeInput = document.getElementById('blog-readTime');
  const imageUrlInput = document.getElementById('blog-imageUrl');

  const blog = {
    id: parseInt(idInput.value, 10) || blogList.length + 1,
    title: titleInput.value,
    date: dateInput.value,
    readTime: parseInt(readTimeInput.value, 10),
    imageUrl: imageUrlInput.value,
  };

  const existingBlogIndex = blogList.findIndex((item) => item.id === blog.id);
  if (existingBlogIndex !== -1) {
    blogList[existingBlogIndex] = blog;
  } else {
    try {
      const createdBlog = await createBlogOnAPI(blog);
      blogList.push(createdBlog);
    } catch (error) {
      alert('Error creating blog');
      return;
    }
  }

  alert('Blog saved successfully');
  window.location.href = 'blog.html';
}

// Event listeners for Edit and Create Blog buttons
if (document.querySelector('.edit-btn')) {
  document.querySelector('.edit-btn').addEventListener('click', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const blogId = urlParams.get('id');
    window.location.href = `blog-form.html?id=${blogId}`;
  });
}

if (document.querySelector('.create-blog-btn')) {
  document.querySelector('.create-blog-btn').addEventListener('click', () => {
    window.location.href = 'blog-form.html';
  });
}