import * as firebase from 'firebase/app';
import { React } from './util';

type useFirebaseStorageHook = [
    firebase.storage.Reference[],
    (upload: any) => firebase.storage.UploadTask,
];

export function useFirebaseStorage(
    { useEffect, useState }: React,
    app: firebase.app.App,
    path: string
): useFirebaseStorageHook {
    const [data, setData] = useState([] as any);
    const user = app.auth().currentUser;
    path = path.replace('$', `${user && user.uid}`);
    const storage = app.storage().ref(path);

    useEffect(
        function subscribe() {
            storage.listAll().then(result => {
                const rootItems = result.items;

                const childItems = Promise.all(
                    result.prefixes.map((prefix) => {
                        return prefix.list().then(prefixResult => {
                            return prefixResult.items;
                        })
                    })
                );
                childItems.then(stuff => {
                    setData(stuff.flat());
                })
            });
        },
        [user, path]
    );

    function put(file: any) {
        throw Error("Not implemented");
        return storage.put(file);
    }

    return [data, put];
}
