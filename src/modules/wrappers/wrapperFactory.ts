


export default class WrapperFactory<Obj extends object, Wrapper extends object> {

    #cache = new Map<object, Wrapper>();
    #builder: (obj: Obj) => Wrapper;

    constructor(builder: (obj: Obj) => Wrapper) {
        this.#builder = builder;
    }



    build(obj: Obj): Wrapper {
        if (this.#cache.has(obj)) {
            return this.#cache.get(obj)!;
        } else {
            const wrapper = this.#builder(obj);
            this.#cache.set(obj, wrapper);
            return wrapper;
        }
    }
}