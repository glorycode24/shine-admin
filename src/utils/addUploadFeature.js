


// src/utils/addUploadFeature.js

const convertFileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file.rawFile);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });

const addUploadFeature = (dataProvider) => {
  return (type, resource, params) => {
    if ((type === 'CREATE' || type === 'UPDATE') && params.data.image?.rawFile) {
      return convertFileToBase64(params.data.image).then((base64Image) => {
        params.data.imageUrl = base64Image;  // send to backend as imageUrl
        delete params.data.image; // remove the original File object
        return dataProvider(type, resource, params);
      });
    }
    return dataProvider(type, resource, params);
  };
};

export default addUploadFeature;
