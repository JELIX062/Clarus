<template>
    <section class="recetas-view">
        <header class="header">
        <div>
            <h2>Expedientes médicos</h2>
            <p class="subtitle">Consulta de información clínica registrada.</p>
        </div>
        </header>

        <div class="filters">
        <input v-model.trim="searchTerm" class="input" type="search" placeholder="Buscar por pacientes" />
        <select v-model="selectedStatus" class="input select">
            <option value="Todas">Todos los estados</option>
            <option v-for="status in statusOptions" :key="status" :value="status">{{ status }}</option>
        </select>
        </div>

        <div class="recipes-grid">
        <article v-for="prescription in filteredPrescriptions" :key="prescription.id" class="recipe-card">
            <div class="card-top">
            <h3>{{ prescription.medicine }}</h3>
            <span class="tag" :class="statusClass[prescription.status]">{{ prescription.status }}</span>
            </div>
            <p class="meta">👨‍⚕️ {{ prescription.doctor }} · 📅 Emitida: {{ prescription.issueDate }}</p>
            <p class="line"><strong>Dosis:</strong> {{ prescription.dose }}</p>
            <p class="line"><strong>Frecuencia:</strong> {{ prescription.frequency }}</p>
            <p class="line"><strong>Duración:</strong> {{ prescription.durationDays }} días</p>
            <p class="line"><strong>Vence:</strong> {{ prescription.expirationDate }}</p>
            <p class="line"><strong>Refills disponibles:</strong> {{ prescription.refillsLeft }}</p>
            <p class="description"><strong>Indicaciones:</strong> {{ prescription.instructions }}</p>
        </article>

        <div v-if="filteredPrescriptions.length === 0" class="empty-state">
            No se encontraron expedientes con los filtros seleccionados.
        </div>
        </div>
    </section>
</template>

<script setup lang="ts">
    import { computed, ref } from 'vue'

    type PrescriptionStatus = 'Vigente' | 'Por vencer' | 'Vencida'

    type Prescription = {
    id: string
    medicine: string
    doctor: string
    dose: string
    frequency: string
    durationDays: number
    issueDate: string
    expirationDate: string
    refillsLeft: number
    instructions: string
    status: PrescriptionStatus
    }

    const statusOptions: PrescriptionStatus[] = ['Vigente', 'Por vencer', 'Vencida']
    const statusClass: Record<PrescriptionStatus, string> = {
    Vigente: 'status-active',
    'Por vencer': 'status-warning',
    Vencida: 'status-stopped'
    }

    const prescriptions = ref<Prescription[]>([])
    const searchTerm = ref('')
    const selectedStatus = ref<'Todas' | PrescriptionStatus>('Todas')

    const filteredPrescriptions = computed(() => {
    const term = searchTerm.value.toLowerCase()
    return prescriptions.value.filter((prescription) => {
        const matchesStatus = selectedStatus.value === 'Todas' || prescription.status === selectedStatus.value
        const matchesSearch = prescription.medicine.toLowerCase().includes(term)
        return matchesStatus && matchesSearch
    })
    })
</script>

<style scoped>
    .recetas-view {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem 1.5rem 3rem;
    display: grid;
    gap: 1.5rem;
    }

    h2,
    h3,
    p {
    margin: 0;
    }

    .subtitle {
    margin-top: 0.35rem;
    color: var(--clarus-oxford);
    }

    .filters {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 0.85rem;
    }

    .recipes-grid {
    display: grid;
    gap: 1rem;
    }

    .recipe-card,
    .empty-state {
    background: var(--clarus-ivory);
    border-radius: 20px;
    padding: 1.25rem;
    box-shadow: 0 18px 45px var(--clarus-shadow);
    }

    .card-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    }

    .meta,
    .line,
    .description {
    color: var(--clarus-oxford);
    margin-top: 0.45rem;
    }

    .input {
    border: 1px solid var(--clarus-border);
    border-radius: 12px;
    padding: 0.7rem 0.85rem;
    font-size: 0.98rem;
    }

    .tag {
    border-radius: 999px;
    padding: 0.3rem 0.72rem;
    font-size: 0.8rem;
    font-weight: 700;
    }

    .status-active {
    background: #dcfce7;
    color: #166534;
    }

    .status-warning {
    background: #fef3c7;
    color: #92400e;
    }

    .status-stopped {
    background: #fee2e2;
    color: #991b1b;
    }

    @media (max-width: 720px) {
    .filters {
        grid-template-columns: 1fr;
    }
    }
</style>
