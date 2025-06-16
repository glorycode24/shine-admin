// src/pages/products/ProductCreate.js

import {
  Create,
  SimpleForm,
  TextInput,
  NumberInput,
  ImageInput,
  ImageField
} from 'react-admin';

export const ProductCreate = () => (
  <Create>
    <SimpleForm>
      <TextInput source="productName" />
      <TextInput source="description" />
      <NumberInput source="price" />
      {/* Upload Image */}
      <ImageInput source="image" label="Product Image" accept="image/*">
        <ImageField source="src" title="title" />
      </ImageInput>
    </SimpleForm>
  </Create>
);
