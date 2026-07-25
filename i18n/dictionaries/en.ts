import type { Messages } from "./fr";

export const en = {
  metadata: {
    rootTitle: "Vestiaire — Your intelligent wardrobe",
    rootDescription:
      "Catalog your wardrobe and create outfits with the clothes you already own.",
    homeTitle: "Vestiaire — Reveal your wardrobe’s potential",
    homeDescription:
      "A personal style assistant for organizing your clothes, creating outfits and choosing what truly complements your wardrobe.",
    wardrobeTitle: "My wardrobe — Vestiaire",
    wardrobeDescription: "Organize the clothes you already own.",
    studioTitle: "Style studio — Vestiaire",
    studioDescription: "Create outfits with pieces from your wardrobe.",
    signInTitle: "Sign in — Vestiaire",
    signInDescription: "Sign in to your Vestiaire space.",
    signUpTitle: "Create an account — Vestiaire",
    signUpDescription: "Create your personal Vestiaire space.",
    forgotPasswordTitle: "Forgot password — Vestiaire",
    forgotPasswordDescription:
      "Request a secure link to reset your password.",
    resetPasswordTitle: "New password — Vestiaire",
    resetPasswordDescription:
      "Choose a new password for your Vestiaire space.",
  },
  common: {
    brand: "Vestiaire",
    homeLabel: "Vestiaire home",
    skipToContent: "Skip to main content",
    close: "Close",
    language: "Language",
    publicNavigation: "Public navigation",
    mainNavigation: "Main navigation",
    wardrobe: "My wardrobe",
    studio: "Style studio",
    signIn: "Sign in",
    signOut: "Sign out",
    account: "{name}’s account",
    all: "All",
    theme: {
      label: "Display theme",
      system: "System",
      light: "Light",
      dark: "Dark",
    },
  },
  landing: {
    navigation: {
      concept: "The concept",
      vision: "The vision",
    },
    openPrototype: "Open the prototype",
    heroEyebrow: "YOUR WARDROBE, AUGMENTED",
    heroTitle: "More style. Fewer unnecessary purchases.",
    heroIntro:
      "Vestiaire turns the clothes you already own into a world of possibilities. Organize your pieces, create outfits and discover what is truly missing.",
    discoverPrototype: "Explore the prototype",
    understandConcept: "Understand the concept",
    localNote:
      "Personal space · Your photographs are private and linked to your account",
    dailySuggestion: "Today’s suggestion",
    casual: "Casual",
    shirt: "Shirt",
    jacket: "Jacket",
    trousers: "Trousers",
    threePieces: "3 pieces from your wardrobe",
    conceptEyebrow: "THE CONCEPT",
    conceptTitle: "Your wardrobe becomes a creative medium.",
    pillars: [
      {
        number: "01",
        title: "Understand",
        description:
          "Each piece is organized by category, colors, seasons, patterns and style potential.",
      },
      {
        number: "02",
        title: "Compose",
        description:
          "The studio reveals new combinations using the clothes you already own.",
      },
      {
        number: "03",
        title: "Complete",
        description:
          "Eventually, recommendations will identify genuine gaps without encouraging unnecessary purchases.",
      },
    ],
    visionEyebrow: "PRODUCT IN PROGRESS",
    visionTitle: "A real experiment, designed to go further.",
    visionDescription:
      "This first version explores a simple belief: understanding what we own helps us dress better and make more thoughtful purchases.",
    visionListLabel: "Development areas",
    visionItems: [
      "Visual garment analysis and background removal",
      "Personalized, explainable recommendations",
      "Virtual try-on as a projection tool",
    ],
    exploreCurrentVersion: "Explore the current version",
    footerDescription:
      "A Next.js, TypeScript and visual intelligence project.",
    accessApplication: "Open the application",
  },
  auth: {
    signInEyebrow: "WELCOME BACK",
    signInTitle: "Return to your wardrobe.",
    signInIntro:
      "Sign in to access your wardrobe and your personal style studio.",
    signUpEyebrow: "YOUR PERSONAL SPACE",
    signUpTitle: "Create your wardrobe.",
    signUpIntro:
      "Create your space to access your private wardrobe on the web.",
    name: "Name",
    namePlaceholder: "Your name",
    email: "Email address",
    emailPlaceholder: "you@example.com",
    password: "Password",
    passwordHint: "At least 12 characters",
    rememberMe: "Keep me signed in on this device",
    submitSignIn: "Sign in",
    submitSignUp: "Create my account",
    submittingSignIn: "Signing in…",
    submittingSignUp: "Creating your account…",
    noAccount: "Don’t have an account yet?",
    alreadyAccount: "Already have an account?",
    createAccount: "Create an account",
    goToSignIn: "Sign in",
    registered:
      "Your account has been created. Check your inbox and verify your email address before signing in.",
    registeredWithoutVerification:
      "Your account is ready. You can now sign in.",
    emailVerified:
      "Your email address has been verified. You can now sign in.",
    emailNotVerified:
      "Your email address has not been verified yet. We’ve just sent you a new verification email.",
    invalidCredentials: "Incorrect email address or password.",
    signUpFailed:
      "The account could not be created. Check the information you entered.",
    genericError: "Something went wrong. Please try again in a moment.",
    forgotPassword: "Forgot password?",
    forgotPasswordEyebrow: "ACCOUNT RECOVERY",
    forgotPasswordTitle: "Regain access to your wardrobe.",
    forgotPasswordIntro:
      "Enter your email address. If an account matches it, we’ll send you a secure link.",
    sendResetLink: "Send reset link",
    sendingResetLink: "Sending link…",
    resetRequestSent:
      "If an account matches this address, an email has been sent. Remember to check your spam folder.",
    backToSignIn: "Back to sign in",
    resetPasswordEyebrow: "ACCOUNT SECURITY",
    resetPasswordTitle: "Choose a new password.",
    resetPasswordIntro:
      "Use a unique password that you don’t use for any other service.",
    newPassword: "New password",
    confirmPassword: "Confirm password",
    resetPassword: "Save new password",
    resettingPassword: "Saving…",
    passwordsDoNotMatch: "The two passwords do not match.",
    invalidResetLink:
      "This link is invalid or has expired. Request a new password reset link.",
    passwordReset:
      "Your password has been changed. You can now sign in.",
    emailFeatureUnavailable:
      "Email delivery is not enabled in this environment yet.",
    privacyNote:
      "Your password is hashed before storage and is never stored as plain text.",
  },
  authEmail: {
    verification: {
      subject: "Verify your email address — Vestiaire",
      heading: "Verify your email address",
      greeting: "Hello {name},",
      introduction:
        "Confirm that this address belongs to you to access your wardrobe.",
      action: "Verify my address",
      expiration: "This link is valid for one hour.",
      ignore:
        "If you didn’t create a Vestiaire account, you can safely ignore this email.",
    },
    passwordReset: {
      subject: "Reset your password — Vestiaire",
      heading: "Reset your password",
      greeting: "Hello {name},",
      introduction:
        "A new password was requested for your account.",
      action: "Choose a new password",
      expiration: "This link is valid for one hour.",
      ignore:
        "If you didn’t make this request, you can safely ignore this email.",
    },
    signature: "Automated email sent by Vestiaire.",
  },
  wardrobe: {
    heroEyebrow: "YOUR WARDROBE, MADE BETTER",
    heroTitleFirst: "Rediscover what",
    heroTitleSecond: "you already own.",
    heroIntro:
      "Bring your wardrobe together, organize every piece and create outfits that feel like you. Your data stays private in your account.",
    itemCountOne: "piece cataloged",
    itemCountMany: "pieces cataloged",
    categoryCount: "categories",
    collection: "COLLECTION",
    title: "My wardrobe",
    filterByCategory: "Filter by category",
    composeAround: "Build an outfit around this piece",
    removeItem: "Remove {name}",
    emptyFilteredTitle: "No pieces in “{category}”",
    emptyTitle: "Your wardrobe starts here",
    emptyFilteredDescription:
      "Choose another category or add new photographs.",
    emptyDescription:
      "Import one or more photographs. File names will help us create an initial classification.",
  },
  studio: {
    eyebrow: "STYLE STUDIO",
    title: "One piece, many possibilities.",
    intro:
      "Choose your starting point and desired look. The studio finds the best combinations in your wardrobe.",
    emptyTitle: "Add a few pieces first",
    emptyDescription: "The studio needs your wardrobe to get started.",
    backToWardrobe: "Return to my wardrobe",
    anchorLabel: "1. Starting piece",
    itemNameLabel: "Item name",
    categoryLabel: "Category",
    colorsLabel: "Colors",
    seasonsLabel: "Seasons",
    patternsLabel: "Patterns",
    potentialStylesLabel: "Potential styles",
    wantedStyleLabel: "2. Desired look",
    composeOutfit: "Create my outfit",
    suggestion: "SUGGESTION",
    outfitTitle: "A natural balance",
    pieceCountOne: "piece",
    pieceCountMany: "pieces",
    whyItWorks: "Why it works",
    neutralExplanation:
      "Neutral tones create a common thread. The pieces share a {style} intention, while the different layers give structure to the silhouette.",
    colorfulExplanation:
      "The tones form a cohesive palette. The pieces share a {style} intention, while the different layers give structure to the silhouette.",
    placeholderTitle: "Your outfit will appear here",
    placeholderDescription:
      "Add colors, seasons and styles to your pieces for a more relevant suggestion.",
  },
  upload: {
    ariaLabel: "Add photographs of clothing",
    choosePhotos: "Choose my photos",
    addItems: "Add pieces",
    uploading: "Adding…",
  },
  notices: {
    wardrobeLoadError:
      "Your wardrobe could not be loaded. Please try again in a moment.",
    uploading: "Analyzing and adding your photographs…",
    itemsUploadFailed:
      "The photographs could not be added. Check their format and try again.",
    itemsUploadPartial:
      "Successful additions: {success}. Failed photographs: {failed}.",
    itemUpdateFailed:
      "The change could not be saved.",
    itemDeleteFailed:
      "The piece could not be removed.",
    itemAdded: "{count} piece added — remember to check its category.",
    itemsAdded: "{count} pieces added — remember to check their categories.",
  },
  routeState: {
    loading: "Preparing your wardrobe…",
    errorTitle: "The wardrobe could not be displayed.",
    errorFallback: "An unexpected error occurred.",
    retry: "Try again",
    notFound: "This page does not exist.",
    backHome: "Return home",
  },
  api: {
    filenameRequired: "The “filename” field is required.",
    invalidRequest: "The request data is invalid.",
    invalidJson: "The request body must contain valid JSON.",
    unauthorized: "Authentication is required.",
    forbidden: "This request is not allowed.",
    garmentNotFound: "This garment could not be found.",
    imageRequired: "A photograph is required.",
    imageTooLarge: "The photograph must not exceed 4 MB.",
    imageTypeUnsupported: "Only JPEG, PNG, and WebP images are accepted.",
    imageNotFound: "This photograph could not be found.",
    imageInUse: "This photograph is still used by a wardrobe item.",
    imageQuotaExceeded: "The limit of 500 photographs per account was reached.",
    internalError: "An unexpected error occurred.",
  },
  attributes: {
    categories: {
      Hauts: "Tops",
      Bas: "Bottoms",
      Robes: "Dresses",
      Vestes: "Jackets",
      Chaussures: "Shoes",
      Accessoires: "Accessories",
    },
    seasons: {
      "Toute saison": "All seasons",
      Printemps: "Spring",
      Été: "Summer",
      Automne: "Autumn",
      Hiver: "Winter",
    },
    styles: {
      Décontracté: "Casual",
      Chic: "Chic",
      Créatif: "Creative",
      Minimal: "Minimal",
      Travail: "Work",
    },
    patterns: {
      Uni: "Solid",
      Rayures: "Stripes",
      Carreaux: "Checks",
      Fleurs: "Floral",
      Pois: "Polka dots",
      Graphique: "Graphic",
      Animal: "Animal print",
      Texturé: "Textured",
    },
    colors: {
      Noir: "Black",
      Blanc: "White",
      Gris: "Grey",
      Beige: "Beige",
      Marron: "Brown",
      Bleu: "Blue",
      Vert: "Green",
      Rouge: "Red",
      Rose: "Pink",
      Jaune: "Yellow",
      Orange: "Orange",
      Violet: "Purple",
    },
  },
} satisfies Messages;
