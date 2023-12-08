# PDFs: Download, Share and Open

Managing PDF and other files is a common task in an Application and depending on the task you may need various plugins to accomplish your needs.

## Downloading Options
There are various ways you **could** download a file in a Capacitor app:
1. Use the [`fetch`](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch) API
2. Use a library like [Axios](https://axios-http.com/) or Angular's [HTTPClient](https://angular.io/api/common/http/HttpClient)
3. Use Capacitor's [Native HTTP methods](https://capacitorjs.com/docs/apis/http)
4. Use Capacitor's [`DownloadFile`](https://capacitorjs.com/docs/apis/filesystem#downloadfile) method

However, there are some caveats to some of these approaches:
- Using `fetch`, `Axios` or `HttpClient` require the right CORS setup to allow downloading the PDF.
- `Capacitor HTTP` is limited by the amount of memory on the device to download and write a Base 64 encoded PDF. It also does not have a way to indicate progress of download.

## Best Way to Download

The best approach is to use the `DownloadFile` method.

In the code below we download the file from a `url`, setting `path` to the filename we want the file to be stored as on the device.

```typescript
import { Directory, Filesystem } from '@capacitor/filesystem';
...
const { path } = await Filesystem.downloadFile({ directory: Directory.Cache, path: 'mypdf.pdf', url }); 
```

When it has downloaded the file it will return the `path`. This can be used to share the PDF or open it.

## Download Progress

To display a progress indicator in the UI we can use the `ion-progress-bar` Ionic component:
```html
    @if (downloading) {
    <ion-progress-bar [value]="progress"></ion-progress-bar>
    }
```

In this example we display the progress bar if we are downloading and the value that represents the progress is in the variable `progress` (a value from 0 to 1).

We first need to setup a listener for download progress:
```typescript
import { NgZone } from '@angular/core';
...
constructor(ngZone: NgZone) {
    Filesystem.addListener('progress', (progressStatus) => {
      ngZone.run(() => {        
        this.progress = progressStatus.bytes / progressStatus.contentLength;
      });
    });
}
```

You will notice that:
- We use `ngZone` to tell Angular that the we are making changes to something in the view (the `progress` variable). This is needed because any events that are emitted from Capacitor are not captured by Angular.
- We calculate the progress by dividing `bytes` by `contentLength` from the `ProgressStatus` object that is given when the `progress` event occurs.

Next, we'll need to modify our `downloadFile` method to make sure it is emitting its progress by setting `progress` to `true`:
```typescript
this.downloading = true;

const { path } = await Filesystem.downloadFile({ 
    directory: Directory.Cache, 
    progress: true,
    path: 'mypdf.pdf', 
    url
    });

this.downloading = false;
```

## Share the PDF
Now that the PDF file is downloaded we may want to share it. This allows another application to use it (for example emailed).

To Share a file we'll use the [`@capacitor/share`](https://capacitorjs.com/docs/apis/share) plugin.

```typescript
import { Share } from '@capacitor/share';
...
    await Share.share(
      {
        title: 'Share PDF',
        text: 'Share the PDF',
        files: [path]
      }
    );
```

Here, we have taken the `path` variable that was set when we downloaded the file and called the `share` method which will show the native dialog to share a file.

## Open the PDF
Alternatively you may want to open and view the PDF. To do this we need to use a plugin and for this example we'll use `@capacitor-community/file-opener`.

First lets install it:
```bash
npm install @capacitor-community/file-opener
npx cap sync
```

Then in our code we'll call the `open` method using the `path` variable that has the location of our downloaded PDF.

```typescript
import { FileOpener } from '@capacitor-community/file-opener';
...

    await FileOpener.open({
      filePath: path,
      openWithDefault: true
    });
```

On iOS this will open a PDF viewer. On Android this will open a file opener dialog showing applications it can open that will view the PDF (for example Google Drive).
