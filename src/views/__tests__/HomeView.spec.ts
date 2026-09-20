import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import HomeView from '@/views/HomeView.vue'

describe('practice navigation', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ authenticated: true, aiAvailable: false }),
      }),
    )
  })

  it('waits for a self-evaluation before moving to the next question', async () => {
    const wrapper = mount(HomeView, { global: { stubs: { RouterLink: true } } })
    await vi.waitFor(() => expect(wrapper.text()).toContain('Start mixed practice'))

    await wrapper.find('.overview-strip button').trigger('click')
    const next = () =>
      wrapper.findAll('button').find((button) => button.text() === 'Next question')!
    expect(next().attributes('disabled')).toBeDefined()

    await wrapper.find('.record-button').trigger('click')
    await wrapper.find('.recording-zone .button').trigger('click')
    expect(next().attributes('disabled')).toBeDefined()

    await wrapper.find('.self-review-panel .confidence-options button').trigger('click')
    expect(next().attributes('disabled')).toBeUndefined()

    await next().trigger('click')
    await nextTick()
    expect(wrapper.find('.rail-position').text()).toContain('2 /')
    expect(next().attributes('disabled')).toBeDefined()
    wrapper.unmount()
  })
})
