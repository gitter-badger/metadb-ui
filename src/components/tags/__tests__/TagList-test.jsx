import React from 'react'
import { shallow, mount } from 'enzyme'
import { expect } from 'chai'
import assign from 'object-assign'

import TagList from '../TagList.jsx'

const defaultTags = [
	'First Tag', 'Second Tag', 'Third Tag'
]

const wrap = (xtend, renderer) => {
	const props = assign({}, {tags: defaultTags}, xtend)
	return renderer(<TagList {...props} />)
}

const shallowWrap = xtend => wrap(xtend, shallow)
const mountWrap = xtend => wrap(xtend, mount)

const EV = {preventDefault: () => {}}

describe('<TagList />', function () {
	it('creates items for each tag supplied', function () {
		const $el = shallowWrap()

		const $li = $el.find('li')
		const $Tags = $el.find('Tag')

		expect($li).has.length(defaultTags.length)
		expect($Tags).has.length(defaultTags.length)
	})

	it('binds `onClick` to correct tag', function () {
		const which = Math.floor(Math.random() * defaultTags.length)
		const tag = defaultTags[which]
		let count = 0

		const onTagClick = t => {
			expect(t).to.equal(tag)
			
			if (t === tag)
				count++
		}

		const $el = shallowWrap({onTagClick})
		const $tag = $el.find('Tag').at(which)

		$tag.simulate('click', EV)

		expect(count).to.equal(1)
	})

	it('does not render remove buttons if `readOnly`', function () {
		const $el = mountWrap({
			onTagRemove: () => {},
			readOnly: true,
		})

		expect($el.find('button')).to.have.length(0)
	})

	it('does not render remove buttons if no `onTagRemove` provided', function () {
		const $el = mountWrap()

		expect($el.find('button')).to.have.length(0)
	})

	it('does render remove buttons if `onTagRemove` provided', function () {
		const $el = mountWrap({onTagRemove: () => {}})

		expect($el.find('button')).to.have.length(defaultTags.length)
	})

	it('binds `onRemove` to correct tag when provided', function () {
		const which = Math.floor(Math.random() * defaultTags.length)
		const tag = defaultTags[which]
		let count = 0

		const onTagRemove = t => {
			expect(t).to.equal(tag)

			if (t === tag)
				count++
		}

		const $el = mountWrap({onTagRemove})
		const $removeBtn = $el.find('button').at(which)

		$removeBtn.simulate('click', EV)

		expect(count).to.equal(1)
	})
})