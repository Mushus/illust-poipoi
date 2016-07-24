/** 保存方法 */
class StorageStrategy {
  /** 保存するときのキー */
  static get StorageKey() { return undefined }
  /** 値が存在していない(undefined)時の初期値 */
  get defaultValue() { return undefined }
  /** 保存するときの変換方法 */
  saveFilter(value) { return JSON.stringify(value) }
  /** 読み込む時の変換方法 */
  loadFilter(value) { return JSON.parse(value) }
}

/** ポイポイモード設定 */
class PoipoiModeStorage extends StorageStrategy {
  static get StorageKey() { return 'poipoi_mode' }
  get defaultValue() { return 0 }
  saveFilter(value) { return Number(value) }
}

/** 定型文 */
class FixedPhraseStorage extends StorageStrategy {
  static get StorageKey() { return 'fixed_Phrase' }
  get defaultValue() { return "#イラストぽいぽい " }
  saveFilter(value) { return value.toString() }
  loadFilter(value) { return value }
}

/** ユーザー */
class UserStorage extends StorageStrategy {
  static get StorageKey() { return 'user' }
  get defaultValue() { return [] }
  saveFilter(value) {
    return JSON.stringify(value.map((user) => user.toStorageValue()))
  }
  loadFilter(value) {
    if (value == null) return this.defaultValue();
    return JSON.parse(value).map((val) => (new User()).fromStorageValue(val))
  }
}

/** 不適切な画像設定設定 */
class SensitiveStorage extends StorageStrategy {
  static get StorageKey() { return 'sensitive' }
  get defaultValue() { return false }
  saveFilter(value) { return JSON.stringify(!!value) }
}

/** 選択しているユーザー */
class SelectedUserIdStorage extends StorageStrategy {
  static get StorageKey() { return 'selected_user_id' }
  get defaultValue() { return "0" }
  saveFilter(value) { return value.toString() }
  loadFilter(value) { return value }
}

/** ストレージ */
class Storage {
  /** すべての設定をオブジェクトとして読み込む */
  static loadAll(callback) {
    var keys = Object.keys(Storage.Items);
    chrome.storage.sync.get(keys, (values) => {
      callback(
        keys.reduce((pVal, cVal, idx) => {
          let key = keys[idx];
          pVal[key] = values[key] === undefined?
          Storage.Items[key].defaultValue:
          Storage.Items[key].loadFilter(values[key]);
          return pVal;
        }, {})
      );
    });

  }

  /** 一つの設定値を読み込む */
  static load(key, callback) {
    chrome.storage.sync.get(key, (val) => callback(
        val === undefined?
        Storage.Items[key].defaultValue:
        Storage.Items[key].loadFilter(val)
      )
    );
  }

  /** 保存する */
  static save(key, val, callback = function(){}) {
    chrome.storage.sync.set({ [key]: Storage.Items[key].saveFilter(val) }, callback);
  }
}
/** getting for storage strategy */
Storage.Items = {
  [PoipoiModeStorage.StorageKey]:     new PoipoiModeStorage(),
  [FixedPhraseStorage.StorageKey]:    new FixedPhraseStorage(),
  [UserStorage.StorageKey]:           new UserStorage(),
  [SensitiveStorage.StorageKey]:      new SensitiveStorage(),
  [SelectedUserIdStorage.StorageKey]: new SelectedUserIdStorage(),
};
