A clickable avatar for changing your own profile picture. `tar-avatar-uploader` wraps a `tar-avatar` and a hidden `<input type="file" accept="image/*">` (`data-testid="avatar-file-input"`, `.uploader__input`) inside a `<label class="uploader">`, so clicking the picture or the `.uploader__cta` text ("Change avatar") opens the file picker.

Inputs are `user` (as for `tar-avatar`) and `size` (default 96). When a file is chosen it emits `fileSelected` with the `File` and resets the input; it does not upload, validate or preview the file itself.
