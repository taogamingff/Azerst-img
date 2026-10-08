import { upload } from "@vercel/blob/client";

const fileInput = document.getElementById("fileInput");
const uploadArea = document.getElementById("uploadArea");

const result = document.getElementById("result");
const preview = document.getElementById("preview");

const fileName = document.getElementById("fileName");
const fileSize = document.getElementById("fileSize");
const fileType = document.getElementById("fileType");

const statusText = document.getElementById("status");

const progressBar = document.getElementById("progressBar");
const progressText = document.getElementById("progressText");

const urlBox = document.getElementById("urlBox");
const imageUrl = document.getElementById("imageUrl");

const copyBtn = document.getElementById("copyBtn");
const uploadAnother = document.getElementById("uploadAnother");

const errorBox = document.getElementById("errorBox");


const allowedTypes = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif"
];


function showError(message) {

  errorBox.textContent = message;
  errorBox.classList.remove("hidden");

}


function hideError() {

  errorBox.textContent = "";
  errorBox.classList.add("hidden");

}


function formatSize(bytes) {

  if (bytes < 1024) {
    return bytes + " B";
  }

  if (bytes < 1024 * 1024) {
    return (bytes / 1024).toFixed(2) + " KB";
  }

  if (bytes < 1024 * 1024 * 1024) {
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  }

  return (bytes / (1024 * 1024 * 1024)).toFixed(2) + " GB";

}


function getExtension(file) {

  const type = file.type.toLowerCase();

  if (type === "image/png") return ".png";

  if (type === "image/jpeg") {

    const name = file.name.toLowerCase();

    if (name.endsWith(".jpeg")) {
      return ".jpeg";
    }

    return ".jpg";
  }

  if (type === "image/webp") return ".webp";

  if (type === "image/gif") return ".gif";

  return ".png";

}


function randomName() {

  const chars =
    "abcdefghijklmnopqrstuvwxyz0123456789";

  let result = "";

  for (let i = 0; i < 6; i++) {

    result +=
      chars[Math.floor(Math.random() * chars.length)];

  }

  return result;

}


function resetProgress() {

  progressBar.style.width = "0%";
  progressText.textContent = "0%";

}


function resetAll() {

  fileInput.value = "";

  result.classList.add("hidden");

  urlBox.classList.add("hidden");

  hideError();

  preview.removeAttribute("src");

  imageUrl.value = "";

  statusText.textContent = "Đang chờ...";

  resetProgress();

}


async function handleFile(file) {

  hideError();

  if (!file) {
    return;
  }


  if (!allowedTypes.includes(file.type)) {

    showError(
      "Định dạng không được hỗ trợ. Vui lòng chọn PNG, JPG, JPEG, WEBP hoặc GIF."
    );

    return;
  }


  result.classList.remove("hidden");

  urlBox.classList.add("hidden");


  fileName.textContent = file.name;

  fileSize.textContent = formatSize(file.size);

  fileType.textContent =
    file.type.replace("image/", "").toUpperCase();


  statusText.textContent = "Đang chuẩn bị...";


  const localPreview =
    URL.createObjectURL(file);

  preview.src = localPreview;


  resetProgress();


  try {

    /*
      Tạo tên URL 6 ký tự.

      Ví dụ:
      7fas39.png
      a82k1z.jpg
      x91abc.webp
    */

    const pathname =
      randomName() + getExtension(file);


    statusText.textContent =
      "Đang tải ảnh lên...";


    const blob = await upload(
      pathname,
      file,
      {
        access: "public",

        handleUploadUrl: "/api/upload",

        contentType: file.type,

        multipart: true,

        clientPayload: JSON.stringify({
          originalName: file.name,
          size: file.size,
          type: file.type
        }),

        onUploadProgress(progress) {

          const percentage =
            Math.round(progress.percentage || 0);

          progressBar.style.width =
            percentage + "%";

          progressText.textContent =
            percentage + "%";

        }
      }
    );


    if (!blob || !blob.url) {

      throw new Error(
        "Vercel Blob không trả về URL ảnh."
      );

    }


    /*
      URL Blob thật:
      https://xxxxx.public.blob.vercel-storage.com/7fas39.png

      URL Azerst:
      https://Azerst-Image-VN.vercel.app/7fas39.png
    */

    const customUrl =
      window.location.origin +
      "/" +
      pathname;


    imageUrl.value = customUrl;


    progressBar.style.width = "100%";
    progressText.textContent = "100%";


    statusText.textContent =
      "Upload thành công ✓";


    urlBox.classList.remove("hidden");


    /*
      Kiểm tra URL custom.
      Nếu rewrite hoạt động,
      trình duyệt sẽ hiển thị ảnh.
    */

    const testImage =
      new Image();

    testImage.onload = () => {

      console.log(
        "Azerst image URL OK:",
        customUrl
      );

    };

    testImage.onerror = () => {

      console.warn(
        "Upload thành công nhưng URL custom chưa truy cập được:",
        customUrl
      );

    };

    testImage.src = customUrl;


  } catch (error) {

    console.error(error);


    statusText.textContent =
      "Upload thất bại";


    progressBar.style.width = "0%";

    progressText.textContent =
      "0%";


    showError(
      error?.message ||
      "Không thể upload ảnh. Hãy kiểm tra Vercel Blob Store."
    );

  }

}


fileInput.addEventListener(
  "change",
  () => {

    const file =
      fileInput.files?.[0];

    handleFile(file);

  }
);


uploadArea.addEventListener(
  "dragover",
  (event) => {

    event.preventDefault();

    uploadArea.classList.add("drag");

  }
);


uploadArea.addEventListener(
  "dragleave",
  () => {

    uploadArea.classList.remove("drag");

  }
);


uploadArea.addEventListener(
  "drop",
  (event) => {

    event.preventDefault();

    uploadArea.classList.remove("drag");

    const file =
      event.dataTransfer.files?.[0];

    handleFile(file);

  }
);


copyBtn.addEventListener(
  "click",
  async () => {

    const value =
      imageUrl.value;

    if (!value) {
      return;
    }

    try {

      await navigator.clipboard.writeText(
        value
      );

      copyBtn.textContent =
        "Đã sao chép ✓";

      setTimeout(() => {

        copyBtn.textContent =
          "Sao chép";

      }, 1500);

    } catch {

      imageUrl.select();

      document.execCommand(
        "copy"
      );

      copyBtn.textContent =
        "Đã sao chép ✓";

    }

  }
);


uploadAnother.addEventListener(
  "click",
  () => {

    resetAll();

    fileInput.click();

  }
);
