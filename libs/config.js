const commerblePublicConfig = {
    rootPrefix: new URL(__CBPAAS_EP__).pathname,
    purchaseShippingUrl: '/checkout/step1',
    purchasePaymentUrl: '/checkout/step2',
    purchaseConfirmUrl: '/checkout/confirm',
    purchaseExternalUrl: '/checkout/external/',
    purchaseCompleteUrl: '/checkout/complete/',
    loginUrl: '/login',
    registerUrl: '/signup',
    registerConfirmUrl: '/signup/confirm',
    registerCompleteUrl: '/signup/complete',
    registerActivateUrl: '/signup/activate',
    recoveryUrl: '/recovery',
}

export default commerblePublicConfig;