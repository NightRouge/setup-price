import { useState, useCallback, useEffect, memo } from "react";
import {
  Banner,
  Card,
  Form,
  FormLayout,
  TextField,
  Button,
  ChoiceList,
  Select,
  Thumbnail,
  Icon,
  Stack,
  TextStyle,
  Layout,
  EmptyState,
  OptionList,
  RadioButton,
  Tag,
  DataTable,
  Scrollable
} from "@shopify/polaris";
import {
  ContextualSaveBar,
  ResourcePicker,
  useAppBridge,
  useNavigate,
} from "@shopify/app-bridge-react";
import { ImageMajor, AlertMinor } from "@shopify/polaris-icons";

/* Import the useAuthenticatedFetch hook included in the Node app template */
import { useAppQuery } from "../hooks/useAppQuery";
import {useAuthenticatedFetch} from "../hooks"
/* Import custom hooks for forms */
import { useForm, useField, notEmptyString } from "@shopify/react-form";
import { data, isMessageModal } from "@shopify/app-bridge/actions/Modal";

const NO_DISCOUNT_OPTION = { label: "No discount", value: "" };

/*
  The discount codes available in the store.

  This variable will only have a value after retrieving discount codes from the API.
*/
const DISCOUNT_CODES = {};

export function QRCodeForm({ QRCode: InitialQRCode }) {
  const [QRCode, setQRCode] = useState(InitialQRCode);
  const [showResourcePicker, setShowResourcePicker] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(QRCode?.product);
  const [tags,setTags] =useState();
  const navigate = useNavigate();
  const appBridge = useAppBridge();
  const fetch = useAuthenticatedFetch();
  const deletedProduct = QRCode?.product?.title === "Deleted product";
  const [picker,setPicker]=useState("")
  const handlePicker =useCallback((_checked,option)=>{
    setPicker(option);
  }) 
  const onSubmit = useCallback(
    (body) => {
      (async () => {
        const parsedBody = body;
        parsedBody.destination = parsedBody.destination[0];
        const QRCodeId = QRCode?.id;
        /* construct the appropriate URL to send the API request to based on whether the QR code is new or being updated */
        let url = QRCodeId ? `/api/qrcodes/${QRCodeId}` : "/api/qrcodes";
        /* a condition to select the appropriate HTTP method: PATCH to update a QR code or POST to create a new QR code */
        const method = QRCodeId ? "PATCH" : "POST";
        /* use (authenticated) fetch from App Bridge to send the request to the API and, if successful, clear the form to reset the ContextualSaveBar and parse the response JSON */
        const response = await fetch(url, {
          method,
          body: JSON.stringify(parsedBody),
          headers: { "Content-Type": "application/json" },
        });
        if (response.ok) {
          makeClean();
          const QRCode = await response.json();
          /* if this is a new QR code, then save the QR code and navigate to the edit page; this behavior is the standard when saving resources in the Shopify admin */
          if (!QRCodeId) {
            navigate(`/qrcodes/${QRCode.id}`);
            /* if this is a QR code update, update the QR code state in this component */
          } else {
            setQRCode(QRCode);
          }
        }
      })();
      return { status: "success" };
    },
    [QRCode, setQRCode]
  );
  

  /*
    Sets up the form state with the useForm hook.

    Accepts a "fields" object that sets up each individual field with a default value and validation rules.

    Returns a "fields" object that is destructured to access each of the fields individually, so they can be used in other parts of the component.

    Returns helpers to manage form state, as well as component state that is based on form state.
  */
  const {
    fields: {
      title,
      productId,
      variantId,
      handle,
      collection,
      amount
    },
    dirty,
    reset,
    submitting,
    submit,
    makeClean,
  } = useForm({
    fields: {
      title: useField({
        value: QRCode?.title || "",
        validates: [notEmptyString("Please name your QR code")],
      }),
      productId: useField({
        value: deletedProduct ? "Deleted product" : QRCode?.product?.id || "",
        validates: [notEmptyString("Please select a product")],
      }),
      variantId: useField(QRCode?.variantId || ""),
      handle: useField(QRCode?.handle || ""),
    },
    onSubmit,
  });


  /*
    This function is called with the selected product whenever the user clicks "Add" in the ResourcePicker.

    It takes the first item in the selection array and sets the selected product to an object with the properties from the "selection" argument.

    It updates the form state using the "onChange" methods attached to the form fields.

    Finally, closes the ResourcePicker.
  */
  const handleProductChange = useCallback(({ selection }) => {
    setSelectedProduct({
      title: selection[0].title,
      images: selection[0].images,
      handle: selection[0].handle,
    });
    productId.onChange(selection[0].id);
    variantId.onChange(selection[0].variants[0].id);
    handle.onChange(selection[0].handle);
    setShowResourcePicker(false);
  }, []);
  const handleCollectionChange = useCallback(({ selection }) => {
    setCollectionPicker(false);
  }, []);
  const handleTagChange = useCallback(({ selection }) => {
    setTagPicker(false);
  }, []);
  /*
    This function is called when a user clicks "Select product" or cancels the ProductPicker.

    It switches between a show and hide state.
  */
  const toggleResourcePicker = useCallback(
    () => setShowResourcePicker(!showResourcePicker),
    [showResourcePicker]
  );

//   const [isDeleting, setIsDeleting] = useState(false);
//   const deleteQRCode = useCallback(async () => {
//   reset();
//   /* The isDeleting state disables the download button and the delete QR code button to show the merchant that an action is in progress */
//   setIsDeleting(true);
//   const response = await fetch(`/api/qrcodes/${QRCode.id}`, {
//     method: "DELETE",
//     headers: { "Content-Type": "application/json" },
//   });

//   if (response.ok) {
//     navigate(`/`);
//   }
// }, [QRCode]);

  const imageSrc = selectedProduct?.images?.edges?.[0]?.node?.url;
  const originalImageSrc = selectedProduct?.images?.[0]?.originalSrc;
  const altText =
    selectedProduct?.images?.[0]?.altText || selectedProduct?.title;

  /* The form layout, created using Polaris and App Bridge components. */
  const [selected,setSelected] = useState('enable')
  const [checked,setChecked] =useState('');
  const handleSelectChange = useCallback((value) =>setSelected(value),[]);
  const handleChoiceChange = useCallback((value) =>setSelectable(value),[]);
  const options =[
    {label: 'Enable' , value: 'enable'},
    {label: 'Disable' , value: 'disable'}
  ]
  const handleChange =useCallback((checked)=> setChecked(checked),[]);
  const [numb,setNumb] =useState('1');
  const handleNumbChange = (value) =>{
    if (value < 0) value = 0;
    else if(value > 99) value = 99;
    setNumb(value);
  }
  const [selectable, setSelectable] = useState([]);
  const [textFieldValue, setTextFieldValue] = useState('');
  const [textField, setTextField] = useState('');
  const handleTextChange = useCallback(
    (value) => {if(value<0) value=0;setTextField(value)},
    [],
  );


  const [collectionPicker, setCollectionPicker]=useState(false)
  const toggleCollectionPicker = useCallback(()=>{
    setCollectionPicker(!collectionPicker)
  },[collectionPicker])

  const [tagPicker, setTagPicker]=useState(false)
  const toggleTagPicker = useCallback(()=>{
    setTagPicker(!tagPicker)
  },[tagPicker])

useEffect(() => {
  //console.log("=== collectionPicker", collectionPicker);
}, [collectionPicker]);

useEffect(() => {
  //console.log(data);
}, [showResourcePicker]);

const { tag } = useAppQuery({
  url:`/api/get-all-product-price`,
  reactQueryOptions: {
    onSuccess: (data) =>{
      console.log(data);
    },
    onError: (error) =>{
      console.log("err useAppQuery", error)
    }
  }
})

  // const [rows,setRows] = useState([]);
  // useEffect(()=>{
  //   setRows(data);
  // }[data]) 

  return (
    <Stack vertical>
      {deletedProduct && (
        <Banner
          title="The product for this QR code no longer exists."
          status="critical"
        >
          <p>
            Scans will be directed to a 404 page, or you can choose another
            product for this QR code.
          </p>
        </Banner>
      )}
      <Layout>
        <Layout.Section>
          <Form>
            <ContextualSaveBar
              saveAction={{
                label: "Save",
                onAction: submit,
                loading: submitting,
                disabled: submitting,
              }}
              discardAction={{
                label: "Discard",
                onAction: reset,
                loading: submitting,
                disabled: submitting,
              }}
              visible={dirty}
              fullWidth
            />
            <FormLayout>
              <Card sectioned title="General Information">
                <TextField
                  {...title}
                  label="Name"
                />
                <TextField
                    label="Priority"
                    type="number"
                    step={1}
                    value={numb}
                    onChange={handleNumbChange}
                    autoComplete="off"
                    min={0}
                    max={99}
                    helpText="Please enter an integer from 0 to 99. 0 is the highest priority."
                />
                <Select 
                    label='Status'
                    options={options}
                    onChange={handleSelectChange}
                    value={selected}/>
              </Card>

              <Card title="Product">
                  <Card.Section>
                  <Stack vertical>
                    <RadioButton label="All product" name="product" value="all" onChange={handleChange}/>
                    <RadioButton label="Specific product"
                    onChange={toggleResourcePicker} name="product" value="some_products" />
                    {showResourcePicker && (
                      <ResourcePicker
                        resourceType="Product"
                        showVariants={false}
                        selectMultiple={false}
                        onCancel={toggleResourcePicker}
                        onSelection={handleProductChange}
                        open
                      />
                    )}{productId.value &&(
                      <Stack alignment="center">
                        {imageSrc || originalImageSrc ?(
                          <Thumbnail 
                          source={imageSrc||originalImageSrc}
                          alt={altText}/>
                        ):(
                          <Thumbnail 
                          source={ImageMajor}
                          color="base"
                          size="small"/>
                        )}
                      </Stack>
                    )}
                    {selectedProduct ? <p>{selectedProduct.title}</p> : null}
                    <RadioButton label="Product collections"
                    onChange={toggleCollectionPicker} name="product"/>
                    {collectionPicker && (
                      <ResourcePicker
                        resourceType="Collection"
                        showVariants={false}
                        onCancel={toggleCollectionPicker}
                        selectMultiple={true}
                        onSelection={handleCollectionChange }
                        open
                      />
                    )}
                    <RadioButton label="Product tags"
                    onChange={toggleTagPicker} name="product"/>
                    {tagPicker && (
                      <ResourcePicker
                        resourceType="Tag"
                        showVariants={false}
                        onCancel={toggleTagPicker}
                        selectMultiple={true}
                        onSelection={handleTagChange}
                        open
                      />
                    )}
                  </Stack>
                  </Card.Section>
                  {/* {productId.value ? (
                    <Stack alignment="center">
                      {imageSrc || originalImageSrc ? (
                        <Thumbnail
                          source={imageSrc || originalImageSrc}
                          alt={altText}
                        />
                      ) : (
                        <Thumbnail
                          source={ImageMajor}
                          color="base"
                          size="small"
                        />
                      )}
                      <TextStyle variation="strong">
                        {selectedProduct.title}
                      </TextStyle>
                    </Stack>
                  ) : (
                    <Stack vertical spacing="extraTight">
                      {productId.error && (
                        <Stack spacing="tight">
                          <Icon source={AlertMinor} color="critical" />
                          <TextStyle variation="negative">
                            {productId.error}
                          </TextStyle>
                        </Stack>
                      )}
                    </Stack>
                  )} */}

                {/* <Card.Section title="Scan Destination">
                  <ChoiceList
                    title="Scan destination"
                    titleHidden
                    choices={[
                      { label: "Link to product page", value: "product" },
                      {
                        label: "Link to checkout page with product in the cart",
                        value: "checkout",
                      },
                    ]}
                    selected={destination.value}
                    onChange={destination.onChange}
                  />
                </Card.Section> */}
              </Card>
              <Card
                sectioned
                title="Custom Price"
              >
                <ChoiceList

                    choices={[
                    {label: 'Apply a price to selected products', 
                    value: 'apply_product',
                    renderChildren: useCallback(
                      (isSelected) =>
                        isSelected && (
                          <TextField
                            label="Amount"
                            type="number"
                            onChange={handleTextChange}
                            value={textField}
                            autoComplete="off"
                            min={0}
                          />
                        ),
                      [handleTextChange, textField],
                    ),
                    },
                    {label: 'Decrease a fixed amount of the original prices of selected products', 
                    value: 'reduce_amount',
                    renderChildren: useCallback(
                      (isSelected) =>
                        isSelected && (
                          <TextField
                            label="Amount"
                            type="number"
                            onChange={handleTextChange}
                            value={textField}
                            autoComplete="off"
                            min={0}
                          />
                        ),
                      [handleTextChange, textField],
                    ),
                    },
                    {
                    label: 'Decrease the original price of selected products by a percentage(%)',
                    value: 'percent',
                    renderChildren: useCallback(
                      (isSelected) =>
                        isSelected && (
                          <TextField
                            label="Percentage"
                            type="number"
                            onChange={handleTextChange}
                            value={textField}
                            autoComplete="off"
                            min={0}
                            max={100}
                          />
                        ),
                      [handleTextChange, textField],
                    ),
                    },
                    ]}
                    selected={selectable}
                    onChange={handleChoiceChange}
                />
              </Card>
            </FormLayout>
          </Form>
        </Layout.Section>
        <Layout.Section secondary>
          <Card title="Result" >

          </Card>
        </Layout.Section>
      </Layout>
    </Stack>
  );
}


