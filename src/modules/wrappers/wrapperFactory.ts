


export default class WrapperFactory<Obj extends object, Wrapper extends object> {


    // not super sure if I should use a WeakMap here but I feel like it makes sense
    #cache = new WeakMap<object, Wrapper>();
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