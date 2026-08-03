// The single CKEditor 5 build for the whole app.
//
// Every form used to import `@ckeditor/ckeditor5-build-classic` directly. That
// bundle is prebuilt, so no extra plugin can be added to it - and the journal
// editor needs the Mention plugin for @-tagging colleagues and citizens.
// Loading the prebuilt bundle next to the `ckeditor5` package is not an option
// either: CKEditor sets a global version marker and throws
// `ckeditor-duplicated-modules` when two builds meet on the same page. So all
// editors are built from this module instead.
//
// The plugin list mirrors what the classic build shipped, so existing note
// content (tables, images, embeds) keeps round-tripping unchanged.
import {
    Autoformat,
    BlockQuote,
    Bold,
    ClassicEditor as ClassicEditorBase,
    Essentials,
    Heading,
    Image,
    ImageCaption,
    ImageResize,
    ImageStyle,
    ImageToolbar,
    ImageUpload,
    Indent,
    Italic,
    Link,
    List,
    MediaEmbed,
    Paragraph,
    PasteFromOffice,
    Table,
    TableToolbar,
    TextTransformation,
} from 'ckeditor5'

export class ClassicEditor extends ClassicEditorBase { }

ClassicEditor.builtinPlugins = [
    Autoformat,
    BlockQuote,
    Bold,
    Essentials,
    Heading,
    Image,
    ImageCaption,
    ImageResize,
    ImageStyle,
    ImageToolbar,
    ImageUpload,
    Indent,
    Italic,
    Link,
    List,
    MediaEmbed,
    Paragraph,
    PasteFromOffice,
    Table,
    TableToolbar,
    TextTransformation,
]

ClassicEditor.defaultConfig = {
    toolbar: {
        items: [
            'undo',
            'redo',
            'heading',
            '|',
            'bold',
            'italic',
            'link',
            'bulletedList',
            'numberedList',
            'blockQuote',
            'imageUpload',
        ],
    },
    image: {
        toolbar: [
            'imageStyle:inline',
            'imageStyle:block',
            'imageStyle:side',
            '|',
            'toggleImageCaption',
            'imageTextAlternative',
        ],
    },
    table: {
        contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells'],
    },
}

export default ClassicEditor
