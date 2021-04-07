
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.35.0' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const data = {
    	"title": {
    		"name": "Jon Lehman",
    		"subtitle": "Principal Product Designer, Front-End Cowboy"
    	},
    	
    	"about": {
    		"text": "I'm a remote (Dallas-Fort Worth) based product designer. Over the last 8 years I have lead product design for small startups, fortune 500's, and everything in between."
    	},
    	
    	"currentJob": {
    		"text": "Principal Designer at Theorem, designing for Apple."
    	},
    	
    	"projects": [
    		{
    			"text":"Geometric Pattern Generator",
    			"link": "https://geometricgenerator.suppply.io"
    		},
    		{
    			"text":"Scan 2 Slides",
    			"link": "http://scan2slides.jonlehman.me/"
    		},
    		{
    			"text":"Model Share",
    			"link": "https://modelshare.app/"
    		},
    	],
    	
    	"notes": [
    		{
    			"text":"Button Ambiguity: Alignment & Order",
    			"link": "https://medium.com/theorem/button-ambiguity-alignment-order-a42736e25334"
    		},
    		{
    			"text":"What is Scan 2 Slides",
    			"link": "https://jonlehman.medium.com/what-is-scan-2-slides-2850d41d6b17"
    		},
    		{
    			"text":"Figma API Demo",
    			"link": "https://jonlehman.medium.com/figma-api-demo-323c1b7ee3a9"
    		},
    		{
    			"text":"Zero Requirement Exercise",
    			"link": "https://jonlehman.medium.com/zero-requirement-exercise-7611d431c91d"
    		},
    		{
    			"text":"Dashboard UI Exploration",
    			"link": "https://jonlehman.medium.com/dashboard-ui-exploration-c9c6ad39b385"
    		},
    		{
    			"text":"Floating Label Experiment",
    			"link": "https://jonlehman.medium.com/floating-label-experiment-e2f549017eab"
    		},
    		{
    			"text":"Side Project Completion Strategy",
    			"link": "https://jonlehman.medium.com/side-project-completion-strategy-3bb9e7259cbe"
    		},
    		{
    			"text":"Quick Survey Experiment",
    			"link": "https://jonlehman.medium.com/quick-survey-experiment-76d44688f8f8"
    		},
    		{
    			"text":"Floating Labels– with Only CSS",
    			"link": "https://medium.com/idea42/floating-labels-with-only-css-81079b14fccb"
    		},
    		{
    			"text":"Why to (Somtimes) Rush Initial Design",
    			"link": "https://medium.com/idea42/why-to-sometimes-rush-initial-design-22ee7c732802"
    		},
    		{
    			"text":"Designers Finally Have a Spot at the Table... Now What?",
    			"link": "https://medium.com/idea42/designers-finally-have-a-spot-at-the-table-now-what-ad2942a7492e"
    		},
    	],
    	
    	"socials": [
    		{
    			"text":"Dribbble",
    			"link": "https://dribbble.com/Jonlehman"
    		},
    		{
    			"text":"Github",
    			"link": "https://github.com/jon-lehman"
    		},
    		{
    			"text":"Instagram",
    			"link": "https://www.instagram.com/jon_lehman/"
    		},
    		{
    			"text":"Email",
    			"link": "mailto:info@jonlehman.me"
    		}
    	]
    	
    };

    /* src/Section.svelte generated by Svelte v3.35.0 */

    const file$4 = "src/Section.svelte";

    // (21:4) {#if label}
    function create_if_block$1(ctx) {
    	let h3;
    	let t;

    	const block = {
    		c: function create() {
    			h3 = element("h3");
    			t = text(/*label*/ ctx[0]);
    			attr_dev(h3, "class", "reduced label svelte-xyi4zd");
    			add_location(h3, file$4, 21, 8, 320);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h3, anchor);
    			append_dev(h3, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*label*/ 1) set_data_dev(t, /*label*/ ctx[0]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(21:4) {#if label}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let div;
    	let t;
    	let current;
    	let if_block = /*label*/ ctx[0] && create_if_block$1(ctx);
    	const default_slot_template = /*#slots*/ ctx[2].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[1], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block) if_block.c();
    			t = space();
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", "svelte-xyi4zd");
    			add_location(div, file$4, 19, 0, 290);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block) if_block.m(div, null);
    			append_dev(div, t);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*label*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					if_block.m(div, t);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 2) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[1], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Section", slots, ['default']);
    	let { label } = $$props;
    	const writable_props = ["label"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Section> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("label" in $$props) $$invalidate(0, label = $$props.label);
    		if ("$$scope" in $$props) $$invalidate(1, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ label });

    	$$self.$inject_state = $$props => {
    		if ("label" in $$props) $$invalidate(0, label = $$props.label);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [label, $$scope, slots];
    }

    class Section extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { label: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Section",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*label*/ ctx[0] === undefined && !("label" in props)) {
    			console.warn("<Section> was created without expected prop 'label'");
    		}
    	}

    	get label() {
    		throw new Error("<Section>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set label(value) {
    		throw new Error("<Section>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Link.svelte generated by Svelte v3.35.0 */

    const file$3 = "src/Link.svelte";

    // (55:0) {#if lineBreak == true}
    function create_if_block(ctx) {
    	let br;

    	const block = {
    		c: function create() {
    			br = element("br");
    			add_location(br, file$3, 55, 4, 1981);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, br, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(br);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(55:0) {#if lineBreak == true}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let a;
    	let span;
    	let t0;
    	let t1;
    	let svg;
    	let path;
    	let t2;
    	let if_block_anchor;
    	let if_block = /*lineBreak*/ ctx[2] == true && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			a = element("a");
    			span = element("span");
    			t0 = text(/*label*/ ctx[0]);
    			t1 = space();
    			svg = svg_element("svg");
    			path = svg_element("path");
    			t2 = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			attr_dev(span, "class", "svelte-tmkr3m");
    			add_location(span, file$3, 49, 4, 1290);
    			attr_dev(path, "fill", "var(--text-secondary-color)");
    			attr_dev(path, "fill-rule", "evenodd");
    			attr_dev(path, "d", "M9.917 3.333a.5.5 0 110-1h4.25a.5.5 0 01.5.5v4.25a.5.5 0 01-1 0V4.04l-3.043 3.043 2.48 2.48a.5.5 0 01.146.354v2.833a1.917 1.917 0 01-1.917 1.917H4.25a1.917 1.917 0 01-1.917-1.917V5.667A1.917 1.917 0 014.25 3.75h2.833a.5.5 0 01.354.146l2.48 2.48 3.043-3.043H9.917zm-.707 3.75L6.876 4.75H4.25a.917.917 0 00-.917.917v7.083a.917.917 0 00.917.917h7.083a.917.917 0 00.917-.917v-2.626L9.917 7.79l-2.48 2.48a.5.5 0 11-.707-.707l2.48-2.48z");
    			attr_dev(path, "clip-rule", "evenodd");
    			add_location(path, file$3, 51, 8, 1419);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "width", "17");
    			attr_dev(svg, "height", "17");
    			attr_dev(svg, "fill", "none");
    			attr_dev(svg, "viewBox", "0 0 17 17");
    			attr_dev(svg, "class", "svelte-tmkr3m");
    			add_location(svg, file$3, 50, 4, 1315);
    			attr_dev(a, "href", /*url*/ ctx[1]);
    			attr_dev(a, "target", "_blank");
    			attr_dev(a, "class", "svelte-tmkr3m");
    			add_location(a, file$3, 48, 0, 1255);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, span);
    			append_dev(span, t0);
    			append_dev(a, t1);
    			append_dev(a, svg);
    			append_dev(svg, path);
    			insert_dev(target, t2, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*label*/ 1) set_data_dev(t0, /*label*/ ctx[0]);

    			if (dirty & /*url*/ 2) {
    				attr_dev(a, "href", /*url*/ ctx[1]);
    			}

    			if (/*lineBreak*/ ctx[2] == true) {
    				if (if_block) ; else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			if (detaching) detach_dev(t2);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Link", slots, []);
    	let { label } = $$props;
    	let { url } = $$props;
    	let { lineBreak = true } = $$props;
    	const writable_props = ["label", "url", "lineBreak"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Link> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("label" in $$props) $$invalidate(0, label = $$props.label);
    		if ("url" in $$props) $$invalidate(1, url = $$props.url);
    		if ("lineBreak" in $$props) $$invalidate(2, lineBreak = $$props.lineBreak);
    	};

    	$$self.$capture_state = () => ({ label, url, lineBreak });

    	$$self.$inject_state = $$props => {
    		if ("label" in $$props) $$invalidate(0, label = $$props.label);
    		if ("url" in $$props) $$invalidate(1, url = $$props.url);
    		if ("lineBreak" in $$props) $$invalidate(2, lineBreak = $$props.lineBreak);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [label, url, lineBreak];
    }

    class Link extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { label: 0, url: 1, lineBreak: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Link",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*label*/ ctx[0] === undefined && !("label" in props)) {
    			console.warn("<Link> was created without expected prop 'label'");
    		}

    		if (/*url*/ ctx[1] === undefined && !("url" in props)) {
    			console.warn("<Link> was created without expected prop 'url'");
    		}
    	}

    	get label() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set label(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get url() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set url(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get lineBreak() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set lineBreak(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/ProfileMedia.svelte generated by Svelte v3.35.0 */
    const file$2 = "src/ProfileMedia.svelte";

    function create_fragment$2(ctx) {
    	let video_1;
    	let source0;
    	let source0_src_value;
    	let source1;
    	let source1_src_value;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			video_1 = element("video");
    			source0 = element("source");
    			source1 = element("source");
    			img = element("img");
    			if (source0.src !== (source0_src_value = "https://firebasestorage.googleapis.com/v0/b/jonlehman-me.appspot.com/o/JonLehman_Profile_SHORT.webm?alt=media&token=91776b1f-fdcd-4ade-ae2e-f02ad16c717d")) attr_dev(source0, "src", source0_src_value);
    			attr_dev(source0, "type", "video/webm");
    			add_location(source0, file$2, 27, 4, 729);
    			if (source1.src !== (source1_src_value = "https://firebasestorage.googleapis.com/v0/b/jonlehman-me.appspot.com/o/JonLehman_Profile_SHORT.mp4?alt=media&token=83658efd-3d83-45a4-a749-904311838e48")) attr_dev(source1, "src", source1_src_value);
    			attr_dev(source1, "type", "video/mp4");
    			add_location(source1, file$2, 28, 4, 920);
    			if (img.src !== (img_src_value = "https://firebasestorage.googleapis.com/v0/b/jonlehman-me.appspot.com/o/JonLehman_Profile_Fallback.jpg?alt=media&token=3aff2d02-9c05-484f-94a7-a8dc4d8f5c09")) attr_dev(img, "src", img_src_value);
    			add_location(img, file$2, 30, 4, 1159);
    			attr_dev(video_1, "poster", "https://firebasestorage.googleapis.com/v0/b/jonlehman-me.appspot.com/o/JonLehman_Profile_Poster.jpg?alt=media&token=9772bb4d-d556-40b8-9ad9-9144ecccb940");
    			video_1.autoplay = "true";
    			video_1.controls = "false";
    			attr_dev(video_1, "preload", "metadata");
    			video_1.muted = true;
    			video_1.loop = true;
    			video_1.playsInline = true;
    			attr_dev(video_1, "class", "svelte-3v89z");
    			add_location(video_1, file$2, 26, 0, 462);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, video_1, anchor);
    			append_dev(video_1, source0);
    			append_dev(video_1, source1);
    			append_dev(video_1, img);
    			/*video_1_binding*/ ctx[1](video_1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(video_1);
    			/*video_1_binding*/ ctx[1](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ProfileMedia", slots, []);
    	let video;

    	onMount(() => {
    		// Removes video controls on iOS
    		$$invalidate(0, video.controls = false, video);
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ProfileMedia> was created with unknown prop '${key}'`);
    	});

    	function video_1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			video = $$value;
    			$$invalidate(0, video);
    		});
    	}

    	$$self.$capture_state = () => ({ onMount, video });

    	$$self.$inject_state = $$props => {
    		if ("video" in $$props) $$invalidate(0, video = $$props.video);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [video, video_1_binding];
    }

    class ProfileMedia extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ProfileMedia",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/Title.svelte generated by Svelte v3.35.0 */
    const file$1 = "src/Title.svelte";

    function create_fragment$1(ctx) {
    	let div;
    	let h1;
    	let t1;
    	let h2;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h1 = element("h1");
    			h1.textContent = `${data.title.name}`;
    			t1 = space();
    			h2 = element("h2");
    			h2.textContent = `${data.title.subtitle}`;
    			attr_dev(h1, "class", "svelte-1n7febq");
    			add_location(h1, file$1, 24, 4, 366);
    			attr_dev(h2, "class", "reduced svelte-1n7febq");
    			add_location(h2, file$1, 25, 4, 397);
    			attr_dev(div, "class", "svelte-1n7febq");
    			add_location(div, file$1, 23, 0, 356);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h1);
    			append_dev(div, t1);
    			append_dev(div, h2);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Title", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Title> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ data });
    	return [];
    }

    class Title extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Title",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function createCommonjsModule(fn) {
      var module = { exports: {} };
    	return fn(module, module.exports), module.exports;
    }

    var insightsJs_umd = createCommonjsModule(function (module, exports) {
    (function (global, factory) {
      factory(exports) ;
    }(commonjsGlobal, (function (exports) {
      function isInBrowser() {
          return typeof window !== "undefined";
      }
      /**
       * Get the current host, including the protocol, origin and port (if any).
       *
       * Does **not** end with a trailing "/".
       */
      function getHost() {
          return location.protocol + "//" + location.host;
      }
      function isReferrerSameHost() {
          if (!isInBrowser()) {
              return false;
          }
          var referrer = document.referrer || "";
          var host = getHost();
          return referrer.substr(0, host.length) === host;
      }

      /**
       * Get the preferred browser locale, of the form: xx, xx-YY or falsy
       */
      function getLocale() {
          var locale = typeof navigator.languages !== "undefined" ? navigator.languages[0] : navigator.language;
          if (locale[0] === '"') {
              locale = locale.substr(1);
          }
          if (locale.length > 0 && locale[locale.length - 1] === '"') {
              locale = locale.substr(0, locale.length - 1);
          }
          if (locale && locale.length === 5 && locale[2] === "-") {
              return locale.substr(0, 3) + locale.substr(3).toLocaleUpperCase();
          }
          return locale;
      }
      /**
       * Track the default locale of the current user.
       */
      function locale() {
          if (!isInBrowser()) {
              return { type: "locale", value: "<not-in-browser>" };
          }
          var value = getLocale() || "<none>";
          return { type: "locale", value: value };
      }
      function getScreenType() {
          var width = window.innerWidth;
          if (width <= 414)
              return "XS";
          if (width <= 800)
              return "S";
          if (width <= 1200)
              return "M";
          if (width <= 1600)
              return "L";
          return "XL";
      }
      /**
       * Track the screen type of the current user, based on window size:
       *
       * - width <= 414: XS -> phone
       * - width <= 800: S -> tablet
       * - width <= 1200: M -> small laptop
       * - width <= 1600: L -> large laptop
       * - width > 1440: XL -> large desktop
       */
      function screenType() {
          if (!isInBrowser()) {
              return { type: "screen-type", value: "<not-in-browser>" };
          }
          return { type: "screen-type", value: getScreenType() };
      }
      /**
       * Track the referrer on the current page, or `<none>` if the page has no referrer.
       */
      function referrer() {
          if (!isInBrowser()) {
              return { type: "referrer", value: "<not-in-browser>" };
          }
          if (isReferrerSameHost()) {
              return { type: "referrer", value: "<none>" };
          }
          return { type: "referrer", value: document.referrer || "<none>" };
      }
      /**
       * Track the current path within the application.
       * By default, does not log the `location.hash` nor the `location.search`
       *
       * @param hash `true` to log the hash, `false` by default
       * @param search `true` to log the hash, `false` by default
       */
      function path(hash, search) {
          if (hash === void 0) { hash = false; }
          if (search === void 0) { search = false; }
          if (!isInBrowser()) {
              return { type: "path", value: "<not-in-browser>" };
          }
          var value = window.location.pathname;
          var _hash = window.location.hash;
          var _search = window.location.search;
          if (hash && search) {
              // the hash contains the search
              value += _hash;
          }
          else if (hash) {
              value += _hash.substr(0, _hash.length - _search.length);
          }
          else if (search) {
              value += _search;
          }
          return { type: "path", value: value };
      }
      /**
       * Track a transition between two values.
       *
       * @param previous The previous value
       * @param next The next value
       */
      function transition(previous, next) {
          return { type: "transition", value: previous + "  ->  " + next };
      }
      /**
       * Track a duration at several intervals:
       *
       * - < 5 seconds
       * - < 15 seconds
       * - < 30 seconds
       * - < 1 minute
       * - < 5 minutes
       * - \> 5 minutes
       *
       * @param durationMs the duration to encode, in milliseconds
       */
      function durationInterval(durationMs, prefix) {
          if (prefix === void 0) { prefix = ""; }
          if (durationMs < 5000) {
              return { type: "duration-interval", value: prefix + "< 5s" };
          }
          if (durationMs < 15000) {
              return { type: "duration-interval", value: prefix + "< 15s" };
          }
          if (durationMs < 30000) {
              return { type: "duration-interval", value: prefix + "< 30s" };
          }
          if (durationMs < 60000) {
              return { type: "duration-interval", value: prefix + "< 1m" };
          }
          if (durationMs < 5 * 60000) {
              return { type: "duration-interval", value: prefix + "< 5m" };
          }
          return { type: "duration-interval", value: prefix + "> 5m" };
      }

      var parameters = /*#__PURE__*/Object.freeze({
        __proto__: null,
        locale: locale,
        screenType: screenType,
        referrer: referrer,
        path: path,
        transition: transition,
        durationInterval: durationInterval
      });

      /**
       * The default options.
       */
      var defaultOptions = {};
      /**
       * A class that contains a `projectId` and related configuration to track events painlessly.
       */
      var App = /** @class */ (function () {
          function App(projectId, options) {
              if (options === void 0) { options = defaultOptions; }
              this.projectId = projectId;
              this.options = options;
              this.uniques = {};
              // variables used when tracking pages
              this.trackPageData = null;
              this.trackPageChange = this.trackPageChange.bind(this);
              this.trackLastPageTimeSpent = this.trackLastPageTimeSpent.bind(this);
          }
          /**
           * Track an occurence of the given event.
           *
           * @param event {TrackEventPayload} The event to track.
           */
          App.prototype.track = function (event) {
              if (this.options.disabled || !isInBrowser()) {
                  return Promise.resolve();
              }
              if (event.unique) {
                  var stringified = JSON.stringify(event);
                  if (this.uniques[stringified])
                      return Promise.resolve();
                  this.uniques[stringified] = true;
              }
              var body = {
                  id: event.id,
                  projectId: this.projectId,
                  ignoreErrors: this.options.ignoreErrors || false
              };
              if (event.remove)
                  body.remove = true;
              if (event.parameters)
                  body.parameters = event.parameters;
              if (event.update)
                  body.update = true;
              // do not use fetch, for IE compatibility
              var request = new XMLHttpRequest();
              request.open("post", "https://getinsights.io/app/tics", true);
              request.setRequestHeader("Content-Type", "application/json");
              request.send(JSON.stringify(body));
          };
          /**
           * Tracks page views. This method checks if the URL changed every so often and tracks new pages accordingly.
           *
           * @param options The options to use for the tracking
           *
           * @returns An object of the form `{ stop(): void }` to stop the tracking
           */
          App.prototype.trackPages = function (options) {
              if (!isInBrowser()) {
                  return { stop: function () { } };
              }
              if (this.trackPageData) {
                  return this.trackPageData.result;
              }
              // Start tracking page changes
              var interval = setInterval(this.trackPageChange, 2000);
              // Calculate the data
              var _a = options || {}, _b = _a.hash, hash = _b === void 0 ? false : _b, _c = _a.search, search = _c === void 0 ? false : _c;
              this.trackPageData = {
                  hash: hash,
                  search: search,
                  path: path(hash, search).value,
                  isOnFirstPage: true,
                  time: Date.now(),
                  result: {
                      stop: function () {
                          clearInterval(interval);
                      }
                  }
              };
              // Track the first/current page view
              this.trackSinglePage(true, this.trackPageData.path);
              window.addEventListener("unload", this.trackLastPageTimeSpent);
              return this.trackPageData.result;
          };
          App.prototype.getPreviousPage = function (first) {
              var dataPath = this.trackPageData && this.trackPageData.path;
              if (!first && dataPath) {
                  return dataPath;
              }
              if (isReferrerSameHost()) {
                  return document.referrer.replace(getHost(), "");
              }
              return document.referrer;
          };
          App.prototype.trackPageChange = function () {
              if (!this.trackPageData)
                  return;
              var _a = this.trackPageData, hash = _a.hash, search = _a.search;
              var newPath = path(hash, search).value;
              if (newPath !== this.trackPageData.path) {
                  this.trackSinglePage(false, newPath);
              }
          };
          App.prototype.trackSinglePage = function (first, path) {
              if (!this.trackPageData)
                  return;
              this.trackPageData.isOnFirstPage = first && !isReferrerSameHost();
              var _a = this.trackPageData, time = _a.time, isOnFirstPage = _a.isOnFirstPage;
              var params = {
                  path: path
              };
              if (isOnFirstPage) {
                  params.uniqueViews = path;
                  params.referrer = referrer();
                  params.locale = locale();
                  params.screenType = screenType();
              }
              var previous = this.getPreviousPage(first);
              if (previous && previous !== path) {
                  params.transitions = transition(previous, path);
                  if (!isOnFirstPage) {
                      var now = Date.now();
                      this.trackPageData.time = now;
                      params.duration = durationInterval(now - time, previous + " - ");
                  }
              }
              this.trackPageData.path = path;
              this.track({
                  id: "page-views",
                  parameters: params
              });
          };
          App.prototype.trackLastPageTimeSpent = function () {
              var time = this.trackPageData && this.trackPageData.time;
              if (!time || typeof navigator.sendBeacon !== "function" || this.options.disabled || !this.trackPageData) {
                  return;
              }
              var _a = this.trackPageData, isOnFirstPage = _a.isOnFirstPage, path = _a.path;
              var params = {};
              // add the duration
              params.duration = durationInterval(Date.now() - time, path + " - ");
              var nextUrl = (document.activeElement && document.activeElement.href) || "";
              var host = getHost();
              if (!nextUrl) {
                  // user closed the window
                  params.bounces = isOnFirstPage ? "Yes" : "No";
              }
              else if (nextUrl[0] !== "/" && nextUrl.substr(0, host.length) !== getHost()) {
                  // link outside of the app
                  params.transitions = transition(path, nextUrl);
              }
              // polyfil for IE, this won't always work, but it's better than nothing.
              navigator.sendBeacon =
                  navigator.sendBeacon ||
                      function (url, body) {
                          var request = new XMLHttpRequest();
                          request.open("post", url, false);
                          request.send(body);
                      };
              navigator.sendBeacon("https://getinsights.io/app/tics", JSON.stringify({
                  id: "page-views",
                  projectId: this.projectId,
                  parameters: params,
                  ignoreErrors: this.options.ignoreErrors || false,
                  update: true
              }));
          };
          return App;
      }());

      /**
       * This file is the entry point for the `insights-js` library.
       *
       * It contains basic methods to initialize and log events:
       * ```typescript
       * init(projectId: string, options?: AppOptions): App
       * track(event: TrackEventPayload): void
       * trackPages(options?: TrackPagesOptions): TrackPagesResult
       * ```
       *
       * As well as the `parameters` helpers.
       */
      /**
       * The default application, or `null` if none.
       */
      exports.DEFAULT_APP = null;
      /**
       * Initialize a default app for the given project with the given options.
       *
       * @param projectId The project for which to initialize the library
       * @param options The options to use
       *
       * @returns The default app
       */
      function init(projectId, options) {
          if (!isInBrowser() || !!exports.DEFAULT_APP) {
              throw new Error("Already initialized!");
          }
          exports.DEFAULT_APP = new App(projectId, options);
          return exports.DEFAULT_APP;
      }
      /**
       * Tracks an event using the default app, you must call `init()` before calling this.
       *
       * @param event The event to track
       */
      function track(event) {
          if (!exports.DEFAULT_APP || !isInBrowser())
              return;
          exports.DEFAULT_APP.track(event);
      }
      /**
       * Tracks page views using the default app.
       * This method checks if the URL changed every so often and tracks new pages accordingly.
       *
       * By default, does not track the `location.hash` nor the `location.search`.
       *
       * @param options The options to use for the tracking
       *
       * @returns An object of the form `{ stop(): void }` to stop the tracking
       */
      function trackPages(options) {
          if (!exports.DEFAULT_APP || !isInBrowser())
              return { stop: function () { } };
          return exports.DEFAULT_APP.trackPages(options);
      }

      exports.App = App;
      exports.init = init;
      exports.parameters = parameters;
      exports.track = track;
      exports.trackPages = trackPages;

      Object.defineProperty(exports, '__esModule', { value: true });

    })));
    });

    /* src/App.svelte generated by Svelte v3.35.0 */

    const { document: document_1 } = globals;
    const file = "src/App.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[0] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	return child_ctx;
    }

    // (79:1) <Section label={"About"}>
    function create_default_slot_4(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = `${data.about.text}`;
    			attr_dev(p, "class", "svelte-2tr7xb");
    			add_location(p, file, 79, 2, 1813);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4.name,
    		type: "slot",
    		source: "(79:1) <Section label={\\\"About\\\"}>",
    		ctx
    	});

    	return block;
    }

    // (83:1) <Section label={"Currently"}>
    function create_default_slot_3(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = `${data.currentJob.text}`;
    			attr_dev(p, "class", "svelte-2tr7xb");
    			add_location(p, file, 83, 2, 1884);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3.name,
    		type: "slot",
    		source: "(83:1) <Section label={\\\"Currently\\\"}>",
    		ctx
    	});

    	return block;
    }

    // (88:2) {#each data.projects as project}
    function create_each_block_2(ctx) {
    	let link;
    	let current;

    	link = new Link({
    			props: {
    				label: /*project*/ ctx[6].text,
    				url: /*project*/ ctx[6].link
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(link.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(link, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(link.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(link.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(link, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(88:2) {#each data.projects as project}",
    		ctx
    	});

    	return block;
    }

    // (87:1) <Section label={"Personal Projects"}>
    function create_default_slot_2(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value_2 = data.projects;
    	validate_each_argument(each_value_2);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*data*/ 0) {
    				each_value_2 = data.projects;
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block_2(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value_2.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_2.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(87:1) <Section label={\\\"Personal Projects\\\"}>",
    		ctx
    	});

    	return block;
    }

    // (94:2) {#each data.notes as note}
    function create_each_block_1(ctx) {
    	let link;
    	let current;

    	link = new Link({
    			props: {
    				label: /*note*/ ctx[3].text,
    				url: /*note*/ ctx[3].link
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(link.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(link, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(link.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(link.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(link, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(94:2) {#each data.notes as note}",
    		ctx
    	});

    	return block;
    }

    // (93:1) <Section label={"Notes"}>
    function create_default_slot_1(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value_1 = data.notes;
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*data*/ 0) {
    				each_value_1 = data.notes;
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value_1.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(93:1) <Section label={\\\"Notes\\\"}>",
    		ctx
    	});

    	return block;
    }

    // (100:2) {#each data.socials as social}
    function create_each_block(ctx) {
    	let link;
    	let current;

    	link = new Link({
    			props: {
    				label: /*social*/ ctx[0].text,
    				url: /*social*/ ctx[0].link,
    				lineBreak: true
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(link.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(link, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(link.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(link.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(link, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(100:2) {#each data.socials as social}",
    		ctx
    	});

    	return block;
    }

    // (99:1) <Section label={"Socials"}>
    function create_default_slot(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value = data.socials;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*data*/ 0) {
    				each_value = data.socials;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(99:1) <Section label={\\\"Socials\\\"}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let html;
    	let link0;
    	let link1;
    	let t0;
    	let div1;
    	let profilemedia;
    	let t1;
    	let div0;
    	let title;
    	let t2;
    	let section0;
    	let t3;
    	let section1;
    	let t4;
    	let section2;
    	let t5;
    	let section3;
    	let t6;
    	let section4;
    	let current;
    	profilemedia = new ProfileMedia({ $$inline: true });
    	title = new Title({ $$inline: true });

    	section0 = new Section({
    			props: {
    				label: "About",
    				$$slots: { default: [create_default_slot_4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	section1 = new Section({
    			props: {
    				label: "Currently",
    				$$slots: { default: [create_default_slot_3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	section2 = new Section({
    			props: {
    				label: "Personal Projects",
    				$$slots: { default: [create_default_slot_2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	section3 = new Section({
    			props: {
    				label: "Notes",
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	section4 = new Section({
    			props: {
    				label: "Socials",
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			html = element("html");
    			link0 = element("link");
    			link1 = element("link");
    			t0 = space();
    			div1 = element("div");
    			create_component(profilemedia.$$.fragment);
    			t1 = space();
    			div0 = element("div");
    			create_component(title.$$.fragment);
    			t2 = space();
    			create_component(section0.$$.fragment);
    			t3 = space();
    			create_component(section1.$$.fragment);
    			t4 = space();
    			create_component(section2.$$.fragment);
    			t5 = space();
    			create_component(section3.$$.fragment);
    			t6 = space();
    			create_component(section4.$$.fragment);
    			document_1.title = "Jon Lehman";
    			attr_dev(html, "lang", "en");
    			add_location(html, file, 65, 1, 1469);
    			attr_dev(link0, "rel", "preconnect");
    			attr_dev(link0, "href", "https://fonts.gstatic.com");
    			add_location(link0, file, 66, 1, 1489);
    			attr_dev(link1, "href", "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono&family=IBM+Plex+Sans:wght@400;600&display=swap");
    			attr_dev(link1, "rel", "stylesheet");
    			add_location(link1, file, 67, 1, 1547);
    			attr_dev(div0, "class", "sticky svelte-2tr7xb");
    			add_location(div0, file, 74, 1, 1742);
    			attr_dev(div1, "class", "container svelte-2tr7xb");
    			add_location(div1, file, 70, 0, 1696);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			append_dev(document_1.head, html);
    			append_dev(document_1.head, link0);
    			append_dev(document_1.head, link1);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div1, anchor);
    			mount_component(profilemedia, div1, null);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			mount_component(title, div0, null);
    			append_dev(div1, t2);
    			mount_component(section0, div1, null);
    			append_dev(div1, t3);
    			mount_component(section1, div1, null);
    			append_dev(div1, t4);
    			mount_component(section2, div1, null);
    			append_dev(div1, t5);
    			mount_component(section3, div1, null);
    			append_dev(div1, t6);
    			mount_component(section4, div1, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const section0_changes = {};

    			if (dirty & /*$$scope*/ 512) {
    				section0_changes.$$scope = { dirty, ctx };
    			}

    			section0.$set(section0_changes);
    			const section1_changes = {};

    			if (dirty & /*$$scope*/ 512) {
    				section1_changes.$$scope = { dirty, ctx };
    			}

    			section1.$set(section1_changes);
    			const section2_changes = {};

    			if (dirty & /*$$scope*/ 512) {
    				section2_changes.$$scope = { dirty, ctx };
    			}

    			section2.$set(section2_changes);
    			const section3_changes = {};

    			if (dirty & /*$$scope*/ 512) {
    				section3_changes.$$scope = { dirty, ctx };
    			}

    			section3.$set(section3_changes);
    			const section4_changes = {};

    			if (dirty & /*$$scope*/ 512) {
    				section4_changes.$$scope = { dirty, ctx };
    			}

    			section4.$set(section4_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(profilemedia.$$.fragment, local);
    			transition_in(title.$$.fragment, local);
    			transition_in(section0.$$.fragment, local);
    			transition_in(section1.$$.fragment, local);
    			transition_in(section2.$$.fragment, local);
    			transition_in(section3.$$.fragment, local);
    			transition_in(section4.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(profilemedia.$$.fragment, local);
    			transition_out(title.$$.fragment, local);
    			transition_out(section0.$$.fragment, local);
    			transition_out(section1.$$.fragment, local);
    			transition_out(section2.$$.fragment, local);
    			transition_out(section3.$$.fragment, local);
    			transition_out(section4.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			detach_dev(html);
    			detach_dev(link0);
    			detach_dev(link1);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div1);
    			destroy_component(profilemedia);
    			destroy_component(title);
    			destroy_component(section0);
    			destroy_component(section1);
    			destroy_component(section2);
    			destroy_component(section3);
    			destroy_component(section4);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);

    	if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    		document.body.classList.add("dark-mode");
    	}

    	//Get Insights Analtyics
    	insightsJs_umd.init("aBcSgrqnvPnJ1Nuy");

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		data,
    		Section,
    		Link,
    		ProfileMedia,
    		Title,
    		init: insightsJs_umd.init,
    		track: insightsJs_umd.track,
    		parameters: insightsJs_umd.parameters
    	});

    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    var app = new App({
    	target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
