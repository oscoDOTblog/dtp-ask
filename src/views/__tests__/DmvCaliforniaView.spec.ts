import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import DmvCaliforniaView from '@/views/DmvCaliforniaView.vue'
import questionBank from '@/data/californiaDmvQuestions.json'

describe('California DMV practice', () => {
  it('loads all 100 supplied questions', () => {
    expect(questionBank.question_count).toBe(100)
    expect(questionBank.questions).toHaveLength(100)
  })

  it('reveals whether a submitted answer is correct before advancing', async () => {
    const wrapper = mount(DmvCaliforniaView, {
      global: { stubs: { RouterLink: true } },
    })

    const submit = wrapper.get('button[type="submit"]')
    expect(submit.attributes('disabled')).toBeDefined()

    await wrapper.get('input[value="A"]').setValue(true)
    await submit.trigger('submit')

    expect(wrapper.get('.answer-result').text()).toContain('Not quite')
    expect(wrapper.get('.answer-result').text()).toContain('correct answer is B')
    expect(wrapper.findAll('.dmv-options label.correct')).toHaveLength(1)
    expect(wrapper.findAll('.dmv-options label.incorrect')).toHaveLength(1)

    await wrapper.get('.button--dmv-next').trigger('click')
    expect(wrapper.get('.dmv-progress-number').text()).toContain('02')
    expect(wrapper.find('.answer-result').exists()).toBe(false)
  })

  it('shuffles upcoming questions without changing the current question', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const wrapper = mount(DmvCaliforniaView, {
      global: { stubs: { RouterLink: true } },
    })
    const firstQuestion = wrapper.get('.dmv-question h1').text()

    await wrapper.get('.dmv-shuffle').trigger('click')
    expect(wrapper.get('.dmv-question h1').text()).toBe(firstQuestion)

    await wrapper.get('input[value="B"]').setValue(true)
    await wrapper.get('form').trigger('submit')
    await wrapper.get('.button--dmv-next').trigger('click')
    expect(wrapper.get('.dmv-question h1').text()).not.toBe(questionBank.questions[1]?.question)
    vi.restoreAllMocks()
  })

  it('randomizes answer display order while preserving the correct answer key', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const wrapper = mount(DmvCaliforniaView, {
      global: { stubs: { RouterLink: true } },
    })

    const displayedKeys = wrapper.findAll('.option-key').map((option) => option.text())
    expect(displayedKeys).not.toEqual(['A', 'B', 'C', 'D'])

    await wrapper.get('input[value="B"]').setValue(true)
    await wrapper.get('form').trigger('submit')
    expect(wrapper.get('.answer-result').text()).toContain('Correct')
    expect(wrapper.findAll('.dmv-options label.correct')).toHaveLength(1)
    vi.restoreAllMocks()
  })
})
